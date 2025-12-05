<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LicEntry;
use App\Models\Client;
use App\Models\City;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class LicEntryController extends Controller
{
     /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = LicEntry::with([
                'client', 
                'client.city',
                'agency',
                'collectionJobType',
                'servicingJobType',
                'bank',
                'branch',
            ]);

            // Include trashed records if requested
            if ($request->has('with_trashed') && $request->with_trashed) {
                $query->withTrashed();
            }

            // Show only trashed records if requested
            if ($request->has('only_trashed') && $request->only_trashed) {
                $query->onlyTrashed();
            }

            // Search filter
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->whereHas('client', function($clientQuery) use ($search) {
                        $clientQuery->where('client_name', 'like', "%{$search}%")
                                  ->orWhere('contact', 'like', "%{$search}%");
                    })
                    ->orWhere('policy_num', 'like', "%{$search}%")
                    ->orWhere('reg_num', 'like', "%{$search}%")
                    ->orWhere('servicing_policy_no', 'like', "%{$search}%");
                });
            }

            // Job type filter
            if ($request->has('job_type')) {
                $query->where('job_type', $request->job_type);
            }

            // Form status filter
            if ($request->has('form_status')) {
                $query->where('form_status', $request->form_status);
            }

            // Agency filter
            if ($request->has('agency_id')) {
                $query->where('agency_id', $request->agency_id);
            }

            // Financial year filter
            if ($request->has('financial_year')) {
                $year = explode('-', $request->financial_year)[0];
                $query->byFinancialYear($year);
            }

            $entries = $query->latest()->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $entries,
                'message' => 'LIC entries retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve LIC entries.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

   /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            DB::beginTransaction();
            
            Log::info('LIC Entry store method called', $request->all());

            // Base validation rules for all entries
            $baseRules = [
                'client_id' => 'required|exists:client,id',
                'date' => 'required|date',
                'time' => 'required|date_format:H:i',
                // Job details
                'job_type' => 'required|in:COLLECTION,SERVICING_TASK',
                'agency_id' => 'required|exists:dropdown_options,id',
                'remark' => 'nullable|string',
                'form_status' => 'required|in:PENDING,COMPLETE,CDA,CANCELLED,OTHER',
            ];

            // Conditional rules based on job_type
            $conditionalRules = [];
            
            if ($request->job_type === 'COLLECTION') {
                $conditionalRules = [
                    'collection_job_type_id' => 'required|exists:dropdown_options,id',
                    'no_of_policy' => 'required|integer|min:1',
                    'policy_num' => 'required|array|min:1',
                    'policy_num.*' => 'required|string|max:50',
                    'premium_amt' => 'required|numeric|min:0',
                    'pay_mode' => 'required|in:CASH,CHEQUE,PAYMENT LINK,ONLINE,RTGS/NEFT',
                    'cheque_num' => 'required_if:pay_mode,CHEQUE|nullable|string|max:50',
                    'bank_name_id' => 'required_if:pay_mode,CHEQUE|nullable|exists:dropdown_options,id',
                    'branch_name_id' => 'required_if:pay_mode,CHEQUE|nullable|exists:dropdown_options,id',
                    'cheque_dt' => 'required_if:pay_mode,CHEQUE|nullable|date',
                    
                    // SERVICING fields should not be present for COLLECTION
                    'servicing_type_job_id' => 'prohibited',
                    'servicing_policy_no' => 'prohibited',
                ];
            } else if ($request->job_type === 'SERVICING_TASK') {
                $conditionalRules = [
                    'servicing_type_job_id' => 'required|exists:dropdown_options,id',
                    'servicing_policy_no' => 'required|string|max:50',
                    
                    // COLLECTION fields should not be present for SERVICING
                    'collection_job_type_id' => 'prohibited',
                    'no_of_policy' => 'prohibited',
                    'policy_num' => 'prohibited',
                    'premium_amt' => 'prohibited',
                    'pay_mode' => 'prohibited',
                    'cheque_num' => 'prohibited',
                    'bank_name_id' => 'prohibited',
                    'branch_name_id' => 'prohibited',
                    'cheque_dt' => 'prohibited',
                ];
            }

            $validator = Validator::make($request->all(), array_merge($baseRules, $conditionalRules));

            if ($validator->fails()) {
                Log::error('Validation failed', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validatedData = $validator->validated();

            // Verify client exists
            $client = Client::with(['city'])->find($validatedData['client_id']);
            if (!$client) {
                return response()->json([
                    'success' => false,
                    'message' => 'Client not found.'
                ], 404);
            }

            // Pre-process data based on job_type BEFORE creating the model
            $processedData = $this->preprocessData($validatedData);

            Log::info('Creating LIC entry with processed data:', $processedData);

            $licEntry = LicEntry::create($processedData);

            Log::info('LIC entry created successfully', ['lic_entry_id' => $licEntry->id]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $licEntry->load([
                    'client', 
                    'client.city',
                    'agency',
                    'collectionJobType',
                    'servicingJobType',
                    'bank',
                    'branch',
                ]),
                'message' => 'LIC entry created successfully.'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('LIC entry creation error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create LIC entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Pre-process data based on job type
     */
    private function preprocessData(array $data): array
    {
        if ($data['job_type'] === 'COLLECTION') {
            // Handle policy numbers array
            if (isset($data['policy_num']) && is_array($data['policy_num'])) {
                $data['policy_num'] = json_encode($data['policy_num']);
            }
            
            // Ensure SERVICING fields are not present
            unset($data['servicing_type_job_id']);
            unset($data['servicing_policy_no']);
        } else if ($data['job_type'] === 'SERVICING_TASK') {
            // Ensure COLLECTION fields are not present
            unset($data['collection_job_type_id']);
            unset($data['no_of_policy']);
            unset($data['policy_num']);
            unset($data['premium_amt']);
            unset($data['pay_mode']);
            unset($data['cheque_num']);
            unset($data['bank_name_id']);
            unset($data['branch_name_id']);
            unset($data['cheque_dt']);
        }

        return $data;
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $entry = LicEntry::with([
                'client', 
                'client.city',
                'agency',
                'collectionJobType',
                'servicingJobType',
                'bank',
                'branch',
            ])->find($id);

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'LIC entry not found.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $entry,
                'message' => 'LIC entry retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve LIC entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            Log::info('Update method called', ['id' => $id, 'request_data' => $request->all()]);

            // Check if request data is empty
            if (empty($request->all())) {
                Log::error('Empty request data received');
                return response()->json([
                    'success' => false,
                    'message' => 'No data provided for update.'
                ], 400);
            }

            $entry = LicEntry::find($id);

            if (!$entry) {
                Log::error('LIC entry not found', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'LIC entry not found.'
                ], 404);
            }

            Log::info('Found entry', ['entry' => $entry->toArray()]);

            // Base validation rules
            $baseRules = [
                'client_id' => 'sometimes|exists:client,id',
                'date' => 'sometimes|date',
                'time' => 'sometimes|date_format:H:i',
                // Job details
                'job_type' => 'sometimes|in:COLLECTION,SERVICING_TASK',
                'agency_id' => 'sometimes|exists:dropdown_options,id',
                'remark' => 'nullable|string',
                'form_status' => 'sometimes|in:PENDING,COMPLETE,CDA,CANCELLED,OTHER',
            ];

            // Determine current job type for validation
            $jobType = $request->has('job_type') ? $request->job_type : $entry->job_type;

            // Conditional rules based on job_type
            $conditionalRules = [];
            
            if ($jobType === 'COLLECTION') {
                $conditionalRules = [
                    'collection_job_type_id' => 'required_with:job_type|exists:dropdown_options,id',
                    'no_of_policy' => 'required_with:job_type|integer|min:1',
                    'policy_num' => 'required_with:job_type|array|min:1',
                    'policy_num.*' => 'required|string|max:50',
                    'premium_amt' => 'required_with:job_type|numeric|min:0',
                    'pay_mode' => 'required_with:job_type|in:CASH,CHEQUE,PAYMENT LINK,ONLINE,RTGS/NEFT',
                    'cheque_num' => 'required_if:pay_mode,CHEQUE|nullable|string|max:50',
                    'bank_name_id' => 'required_if:pay_mode,CHEQUE|nullable|exists:dropdown_options,id',
                    'branch_name_id' => 'required_if:pay_mode,CHEQUE|nullable|exists:dropdown_options,id',
                    'cheque_dt' => 'required_if:pay_mode,CHEQUE|nullable|date',
                    
                    // SERVICING fields should not be present for COLLECTION
                    'servicing_type_job_id' => 'prohibited',
                    'servicing_policy_no' => 'prohibited',
                ];
            } else if ($jobType === 'SERVICING_TASK') {
                $conditionalRules = [
                    'servicing_type_job_id' => 'required_with:job_type|exists:dropdown_options,id',
                    'servicing_policy_no' => 'required_with:job_type|string|max:50',
                    
                    // COLLECTION fields should not be present for SERVICING
                    'collection_job_type_id' => 'prohibited',
                    'no_of_policy' => 'prohibited',
                    'policy_num' => 'prohibited',
                    'premium_amt' => 'prohibited',
                    'pay_mode' => 'prohibited',
                    'cheque_num' => 'prohibited',
                    'bank_name_id' => 'prohibited',
                    'branch_name_id' => 'prohibited',
                    'cheque_dt' => 'prohibited',
                ];
            }

            $validator = Validator::make($request->all(), array_merge($baseRules, $conditionalRules));

            if ($validator->fails()) {
                Log::error('Validation failed', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validatedData = $validator->validated();
            Log::info('Validated data', $validatedData);

            // Pre-process data before update
            $processedData = $this->preprocessData($validatedData);

            Log::info('Data before update', $processedData);
            
            $updated = $entry->update($processedData);
            
            Log::info('Update result', ['updated' => $updated, 'entry_after' => $entry->fresh()->toArray()]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $entry->fresh()->load([
                    'client', 
                    'client.city',
                    'agency',
                    'collectionJobType',
                    'servicingJobType',
                    'bank',
                    'branch',
                ]),
                'message' => 'LIC entry updated successfully.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update LIC entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage (Soft Delete).
     */
    public function destroy($id)
    {
        try {
            $entry = LicEntry::find($id);

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'LIC entry not found.'
                ], 404);
            }

            $entry->delete();

            return response()->json([
                'success' => true,
                'message' => 'LIC entry deleted successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete LIC entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore a soft deleted LIC entry.
     */
    public function restore($id)
    {
        try {
            $entry = LicEntry::withTrashed()->find($id);

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'LIC entry not found.'
                ], 404);
            }

            if (!$entry->trashed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'LIC entry is not deleted.'
                ], 400);
            }

            $entry->restore();

            return response()->json([
                'success' => true,
                'data' => $entry->fresh()->load([
                    'client', 
                    'client.city',
                    'agency',
                    'collectionJobType',
                    'servicingJobType',
                    'bank',
                    'branch',
                ]),
                'message' => 'LIC entry restored successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore LIC entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Permanently delete a LIC entry.
     */
    public function forceDelete($id)
    {
        try {
            $entry = LicEntry::withTrashed()->find($id);

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'LIC entry not found.'
                ], 404);
            }

            $entry->forceDelete();

            return response()->json([
                'success' => true,
                'message' => 'LIC entry permanently deleted successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to permanently delete LIC entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get LIC entry by registration number
     */
    public function getByRegNum($regNum)
    {
        try {
            $entry = LicEntry::with([
                'client', 
                'agency',
                'collectionJobType',
                'servicingJobType',
                'bank',
                'branch',
            ])
                ->where('reg_num', $regNum)
                ->first();

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'LIC entry not found.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $entry,
                'message' => 'LIC entry retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve LIC entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get LIC entries by policy number
     */
    public function getByPolicyNum($policyNum)
    {
        try {
            $entries = LicEntry::with([
                'client', 
                'agency',
                'collectionJobType',
                'servicingJobType',
                'bank',
                'branch',
            ])
                ->where(function($query) use ($policyNum) {
                    $query->where('policy_num', 'like', "%{$policyNum}%")
                          ->orWhere('servicing_policy_no', 'like', "%{$policyNum}%");
                })
                ->latest()
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $entries,
                'message' => 'LIC entries retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve LIC entries.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics
     */
    public function getStats()
    {
        try {
            $totalEntries = LicEntry::count();
            $collectionEntries = LicEntry::collection()->count();
            $servicingEntries = LicEntry::servicing()->count();
            $pendingEntries = LicEntry::pending()->count();
            $completeEntries = LicEntry::complete()->count();
            $deletedEntries = LicEntry::onlyTrashed()->count();
            
            $entriesByStatus = LicEntry::groupBy('form_status')
                ->selectRaw('form_status, count(*) as count')
                ->get();

            $totalPremium = LicEntry::sum('premium_amt');

            $currentYear = date('Y');
            $currentMonth = date('n');
            $financialYear = $currentMonth >= 4 ? $currentYear : $currentYear - 1;
            
            $nextRegNum = LicEntry::byFinancialYear($financialYear)->max('reg_num');
            $nextRegNum = $nextRegNum ? $nextRegNum + 1 : 1;

            return response()->json([
                'success' => true,
                'data' => [
                    'total_entries' => $totalEntries,
                    'collection_entries' => $collectionEntries,
                    'servicing_entries' => $servicingEntries,
                    'pending_entries' => $pendingEntries,
                    'complete_entries' => $completeEntries,
                    'deleted_entries' => $deletedEntries,
                    'entries_by_status' => $entriesByStatus,
                    'total_premium' => $totalPremium,
                    'current_financial_year' => $financialYear . '-' . ($financialYear + 1),
                    'next_reg_num' => $nextRegNum
                ],
                'message' => 'Statistics retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get LIC entries by client
     */
    public function getByClient($clientId)
    {
        try {
            $entries = LicEntry::with([
                'agency',
                'collectionJobType',
                'servicingJobType',
                'bank',
                'branch',
            ])
                ->where('client_id', $clientId)
                ->latest()
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $entries,
                'message' => 'Client LIC entries retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve client LIC entries.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}