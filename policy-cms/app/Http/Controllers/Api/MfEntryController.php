<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MfEntry;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class MfEntryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = MfEntry::with([
                'client', 
                'client.city',
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
                    ->orWhere('referance', 'like', "%{$search}%")
                    ->orWhere('reg_num', 'like', "%{$search}%");
                });
            }

            // MF type filter
            if ($request->has('mf_type')) {
                $query->where('mf_type', $request->mf_type);
            }

            // Form status filter
            if ($request->has('form_status')) {
                $query->where('form_status', $request->form_status);
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
                'message' => 'MF entries retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve MF entries.',
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
            
            Log::info('MF Entry store method called', $request->all());

            // Base validation rules for all entries
            $baseRules = [
                'client_id' => 'required|exists:client,id',
                'date' => 'required|date',
                'time' => 'required|date_format:H:i',
                'mf_type' => 'required|in:MF,INSURANCE',
                'amt' => 'required|numeric|min:0',
                'day_of_month' => 'nullable|integer|min:1|max:31',
                'deadline' => 'nullable|date',
                'referance' => 'nullable|string|max:255',
                'remark' => 'nullable|string',
                'form_status' => 'required|in:PENDING,COMPLETE',
            ];

            // Conditional rules based on mf_type
            $conditionalRules = [];
            
            if ($request->mf_type === 'MF') {
                $conditionalRules = [
                    'mf_option' => 'required|in:SIP,SWP,LUMSUM',
                    // INSURANCE fields should not be present for MF
                    'insurance_option' => 'prohibited',
                ];
            } else if ($request->mf_type === 'INSURANCE') {
                $conditionalRules = [
                    'insurance_option' => 'required|in:LIC,GIC',
                    // MF fields should not be present for INSURANCE
                    'mf_option' => 'prohibited',
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

            // Pre-process data based on mf_type BEFORE creating the model
            $processedData = $this->preprocessData($validatedData);

            Log::info('Creating MF entry with processed data:', $processedData);

            $mfEntry = MfEntry::create($processedData);

            Log::info('MF entry created successfully', ['mf_entry_id' => $mfEntry->id]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $mfEntry->load([
                    'client', 
                    'client.city',
                ]),
                'message' => 'MF entry created successfully.'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('MF entry creation error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create MF entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Pre-process data based on mf_type
     */
    private function preprocessData(array $data): array
    {
        if ($data['mf_type'] === 'MF') {
            // Ensure INSURANCE fields are not present
            unset($data['insurance_option']);
        } else if ($data['mf_type'] === 'INSURANCE') {
            // Ensure MF fields are not present
            unset($data['mf_option']);
        }

        return $data;
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $entry = MfEntry::with([
                'client', 
                'client.city',
            ])->find($id);

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'MF entry not found.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $entry,
                'message' => 'MF entry retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve MF entry.',
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

            $entry = MfEntry::find($id);

            if (!$entry) {
                Log::error('MF entry not found', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'MF entry not found.'
                ], 404);
            }

            Log::info('Found entry', ['entry' => $entry->toArray()]);

            // Base validation rules
            $baseRules = [
                'client_id' => 'sometimes|exists:client,id',
                'date' => 'sometimes|date',
                'time' => 'sometimes|date_format:H:i',
                'mf_type' => 'sometimes|in:MF,INSURANCE',
                'amt' => 'sometimes|numeric|min:0',
                'day_of_month' => 'nullable|integer|min:1|max:31',
                'deadline' => 'nullable|date',
                'referance' => 'nullable|string|max:255',
                'remark' => 'nullable|string',
                'form_status' => 'sometimes|in:PENDING,COMPLETE',
            ];

            // Determine current mf_type for validation
            $mfType = $request->has('mf_type') ? $request->mf_type : $entry->mf_type;

            // Conditional rules based on mf_type
            $conditionalRules = [];
            
            if ($mfType === 'MF') {
                $conditionalRules = [
                    'mf_option' => 'required_with:mf_type|in:SIP,SWP,LUMSUM',
                    // INSURANCE fields should not be present for MF
                    'insurance_option' => 'prohibited',
                ];
            } else if ($mfType === 'INSURANCE') {
                $conditionalRules = [
                    'insurance_option' => 'required_with:mf_type|in:LIC,GIC',
                    // MF fields should not be present for INSURANCE
                    'mf_option' => 'prohibited',
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
                ]),
                'message' => 'MF entry updated successfully.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update MF entry.',
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
            $entry = MfEntry::find($id);

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'MF entry not found.'
                ], 404);
            }

            $entry->delete();

            return response()->json([
                'success' => true,
                'message' => 'MF entry deleted successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete MF entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore a soft deleted MF entry.
     */
    public function restore($id)
    {
        try {
            $entry = MfEntry::withTrashed()->find($id);

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'MF entry not found.'
                ], 404);
            }

            if (!$entry->trashed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'MF entry is not deleted.'
                ], 400);
            }

            $entry->restore();

            return response()->json([
                'success' => true,
                'data' => $entry->fresh()->load([
                    'client', 
                    'client.city',
                ]),
                'message' => 'MF entry restored successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore MF entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Permanently delete a MF entry.
     */
    public function forceDelete($id)
    {
        try {
            $entry = MfEntry::withTrashed()->find($id);

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'MF entry not found.'
                ], 404);
            }

            $entry->forceDelete();

            return response()->json([
                'success' => true,
                'message' => 'MF entry permanently deleted successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to permanently delete MF entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get MF entry by registration number
     */
    public function getByRegNum($regNum)
    {
        try {
            $entry = MfEntry::with([
                'client', 
                'client.city',
            ])
                ->where('reg_num', $regNum)
                ->first();

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'MF entry not found.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $entry,
                'message' => 'MF entry retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve MF entry.',
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
            $totalEntries = MfEntry::count();
            $mfEntries = MfEntry::mf()->count();
            $insuranceEntries = MfEntry::insurance()->count();
            $pendingEntries = MfEntry::pending()->count();
            $completeEntries = MfEntry::complete()->count();
            $deletedEntries = MfEntry::onlyTrashed()->count();
            
            $totalAmount = MfEntry::sum('amt');
            $mfAmount = MfEntry::mf()->sum('amt');
            $insuranceAmount = MfEntry::insurance()->sum('amt');

            $currentYear = date('Y');
            $currentMonth = date('n');
            $financialYear = $currentMonth >= 4 ? $currentYear : $currentYear - 1;
            
            $nextRegNum = MfEntry::byFinancialYear($financialYear)->max('reg_num');
            $nextRegNum = $nextRegNum ? $nextRegNum + 1 : 1;

            return response()->json([
                'success' => true,
                'data' => [
                    'total_entries' => $totalEntries,
                    'mf_entries' => $mfEntries,
                    'insurance_entries' => $insuranceEntries,
                    'pending_entries' => $pendingEntries,
                    'complete_entries' => $completeEntries,
                    'deleted_entries' => $deletedEntries,
                    'total_amount' => $totalAmount,
                    'mf_amount' => $mfAmount,
                    'insurance_amount' => $insuranceAmount,
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
     * Get MF entries by client
     */
    public function getByClient($clientId)
    {
        try {
            $entries = MfEntry::where('client_id', $clientId)
                ->latest()
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $entries,
                'message' => 'Client MF entries retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve client MF entries.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}