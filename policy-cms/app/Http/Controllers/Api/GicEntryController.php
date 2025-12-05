<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GicEntry;
use App\Models\Client;
use App\Models\DropdownOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class GicEntryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = GicEntry::with([
                'client', 
                'vehicleType', 
                'vehicle', 
                'nonmotorPolicyType', 
                'nonmotorPolicySubtype',
                'adviser',
                'insuranceCompany',
                'bank',
            ]);

            // Search filter
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->whereHas('client', function($clientQuery) use ($search) {
                         $clientQuery->where('client_name', 'like', "%{$search}%");
                     })
                      ->orWhere('policy_num', 'like', "%{$search}%")
                      ->orWhere('reg_num', 'like', "%{$search}%")
                      ->orWhere('mv_num', 'like', "%{$search}%");
                });
            }

            // Policy type filter
            if ($request->has('policy_type')) {
                $query->where('policy_type', $request->policy_type);
            }

            // Form status filter
            if ($request->has('form_status')) {
                $query->where('form_status', $request->form_status);
            }

            // Insurance company filter
            if ($request->has('insurance_company_id')) {
                $query->where('insurance_company_id', $request->insurance_company_id);
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
                'message' => 'GIC entries retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve GIC entries.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getClientsGic($client_id = null)
{
    try {
        // If client_id is provided, get specific client's GIC entries
        if ($client_id) {
            $gicEntries = GicEntry::with([
                    'client',
                    'client.city',
                    'client.inqueryFor',
                    'vehicleType',
                    'vehicle',
                    'nonmotorPolicyType',
                    'nonmotorPolicySubtype',
                    'insuranceCompany',
                    'bankName',
                    'branchName'
                ])
                ->where('client_id', $client_id)
                ->latest()
                ->get();

            return response()->json([
                'success' => true,
                'data' => $gicEntries,
                'message' => "GIC entries for client ID {$client_id} retrieved successfully."
            ]);
        }
        
        // If no client_id provided, get all GIC entries with client details
        $gicEntries = GicEntry::with([
                'client',
                'client.city',
                'client.inqueryFor',
                'vehicleType',
                'vehicle',
                'nonmotorPolicyType',
                'nonmotorPolicySubtype',
                'adviserName',
                'insuranceCompany',
                'bankName',
                'branchName'
            ])
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $gicEntries,
            'message' => "All GIC entries with client details retrieved successfully."
        ]);

    } catch (\Exception $e) {
        Log::error('Get GIC entries error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to retrieve GIC entries.',
            'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
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
            
            Log::info('GIC Entry store method called', $request->all());

            // Base validation rules
            $validator = Validator::make($request->all(), [
                'client_id' => 'required|exists:client,id',
                'date' => 'required|date',
                'time' => 'required|date_format:H:i',
                'policy_type' => 'required|in:MOTOR,NONMOTOR',
                'premium_amt' => 'required|numeric|min:0',
                'adv_amt' => 'required|numeric|min:0',
                'bal_amt' => 'required|numeric|min:0',
                'recov_amt' => 'required|numeric|min:0',
                'adviser_name_id' => 'required|exists:dropdown_options,id',
                'policy_num' => 'required|string|max:50',
                'insurance_company_id' => 'required|exists:dropdown_options,id',
                'policy_duration' => 'required|in:1YR,LONG,SHORT',
                'start_dt' => 'required|date',
                'end_dt' => 'required|date|after:start_dt',
                'pay_mode' => 'required|in:CASH,CHEQUE,PAYMENT LINK,ONLINE,RTGS/NEFT',
                'cheque_num' => 'required_if:pay_mode,CHEQUE|nullable|string|max:50',
                'bank_name_id' => 'required_if:pay_mode,CHEQUE|nullable|exists:dropdown_options,id',
                'branch_name_id' => 'required_if:pay_mode,CHEQUE|nullable|exists:dropdown_options,id',
                'cheque_dt' => 'required_if:pay_mode,CHEQUE|nullable|date',
                'responsibility' => 'nullable|string',
                'remark' => 'nullable|string',
                'form_status' => 'required|in:PENDING,COMPLETE,CDA,CANCELLED,OTHER',
            ]);

            // Add conditional rules based on policy type
            $validator->sometimes('motor_subtype', 'required|in:A,B,SAOD,ENDST', function ($input) {
                return $input->policy_type === 'MOTOR';
            });

            $validator->sometimes('mv_num', 'nullable|string|max:20', function ($input) {
                return $input->policy_type === 'MOTOR';
            });

            $validator->sometimes('vehicle_type_id', 'required|exists:dropdown_options,id', function ($input) {
                return $input->policy_type === 'MOTOR';
            });

            $validator->sometimes('vehicle_id', 'required|exists:dropdown_options,id', function ($input) {
                return $input->policy_type === 'MOTOR';
            });

            $validator->sometimes('nonmotor_policy_type_id', 'required|exists:dropdown_options,id', function ($input) {
                return $input->policy_type === 'NONMOTOR';
            });

            $validator->sometimes('nonmotor_policy_subtype_id', 'required|exists:dropdown_options,id', function ($input) {
                return $input->policy_type === 'NONMOTOR';
            });

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
            $client = Client::find($validatedData['client_id']);
            if (!$client) {
                return response()->json([
                    'success' => false,
                    'message' => 'Client not found.'
                ], 404);
            }

            // Set null values for non-applicable fields based on policy type
            if ($validatedData['policy_type'] === 'MOTOR') {
                $validatedData['nonmotor_policy_type_id'] = null;
                $validatedData['nonmotor_policy_subtype_id'] = null;
            } else {
                $validatedData['motor_subtype'] = null;
                $validatedData['mv_num'] = null;
                $validatedData['vehicle_type_id'] = null;
                $validatedData['vehicle_id'] = null;
            }

            Log::info('Creating GIC entry with data:', $validatedData);

            $gicEntry = GicEntry::create($validatedData);

            Log::info('GIC entry created successfully', ['gic_entry_id' => $gicEntry->id]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $gicEntry->load([
                    'client', 
                    'vehicleType', 
                    'vehicle', 
                    'nonmotorPolicyType', 
                    'nonmotorPolicySubtype',
                    'adviser',
                    'insuranceCompany',
                    'bank'
                ]),
                'message' => 'GIC entry created successfully.'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('GIC entry creation error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create GIC entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $entry = GicEntry::with([
                'client', 
                'vehicleType', 
                'vehicle', 
                'nonmotorPolicyType', 
                'nonmotorPolicySubtype',
                'adviser',
                'insuranceCompany',
                'bank',
            ])->find($id);

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'GIC entry not found.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $entry,
                'message' => 'GIC entry retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve GIC entry.',
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

            $entry = GicEntry::find($id);

            if (!$entry) {
                Log::error('GIC entry not found', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'GIC entry not found.'
                ], 404);
            }

            Log::info('Found entry', ['entry' => $entry->toArray()]);

            // Base validation rules
            $validator = Validator::make($request->all(), [
                'client_id' => 'sometimes|exists:client,id',
                'date' => 'sometimes|date',
                'time' => 'sometimes|date_format:H:i',
                'policy_type' => 'sometimes|in:MOTOR,NONMOTOR',
                'premium_amt' => 'sometimes|numeric|min:0',
                'adv_amt' => 'sometimes|numeric|min:0',
                'bal_amt' => 'sometimes|numeric|min:0',
                'recov_amt' => 'sometimes|numeric|min:0',
                'adviser_name_id' => 'sometimes|exists:dropdown_options,id',
                'policy_num' => 'sometimes|string|max:50',
                'insurance_company_id' => 'sometimes|exists:dropdown_options,id',
                'policy_duration' => 'sometimes|in:1YR,LONG,SHORT',
                'start_dt' => 'sometimes|date',
                'end_dt' => 'sometimes|date|after:start_dt',
                'pay_mode' => 'sometimes|in:CASH,CHEQUE,PAYMENT LINK,ONLINE,RTGS/NEFT',
                'cheque_num' => 'required_if:pay_mode,CHEQUE|nullable|string|max:50',
                'bank_name_id' => 'required_if:pay_mode,CHEQUE|nullable|exists:dropdown_options,id',
                'branch_name_id' => 'required_if:pay_mode,CHEQUE|nullable|exists:dropdown_options,id',
                'cheque_dt' => 'required_if:pay_mode,CHEQUE|nullable|date',
                'responsibility' => 'nullable|string',
                'remark' => 'nullable|string',
                'form_status' => 'sometimes|in:PENDING,COMPLETE,CDA,CANCELLED,OTHER',
            ]);

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

            // Handle policy type specific fields
            if (isset($validatedData['policy_type'])) {
                if ($validatedData['policy_type'] === 'MOTOR') {
                    $validatedData['nonmotor_policy_type_id'] = null;
                    $validatedData['nonmotor_policy_subtype_id'] = null;
                } else {
                    $validatedData['motor_subtype'] = null;
                    $validatedData['mv_num'] = null;
                    $validatedData['vehicle_type_id'] = null;
                    $validatedData['vehicle_id'] = null;
                }
            }

            Log::info('Data before update', $validatedData);
            
            $updated = $entry->update($validatedData);
            
            Log::info('Update result', ['updated' => $updated, 'entry_after' => $entry->fresh()->toArray()]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $entry->fresh()->load([
                    'client', 
                    'vehicleType', 
                    'vehicle', 
                    'nonmotorPolicyType', 
                    'nonmotorPolicySubtype',
                    'adviser',
                    'insuranceCompany',
                    'bank',
                ]),
                'message' => 'GIC entry updated successfully.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update GIC entry.',
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
            DB::beginTransaction();

            $entry = GicEntry::find($id);

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'GIC entry not found.'
                ], 404);
            }

            // Soft delete the entry
            $entry->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'GIC entry soft deleted successfully.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('GIC entry soft delete error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to soft delete GIC entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Permanently delete the specified resource (Force Delete).
     */
    public function forceDestroy($id)
    {
        try {
            DB::beginTransaction();

            $entry = GicEntry::withTrashed()->find($id);

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'GIC entry not found.'
                ], 404);
            }

            // Permanently delete the entry
            $entry->forceDelete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'GIC entry permanently deleted successfully.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('GIC entry force delete error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to permanently delete GIC entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore a soft deleted GIC entry.
     */
    public function restore($id)
    {
        try {
            DB::beginTransaction();

            $entry = GicEntry::withTrashed()->find($id);

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'GIC entry not found.'
                ], 404);
            }

            if (!$entry->trashed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'GIC entry is not deleted.'
                ], 400);
            }

            // Restore the entry
            $entry->restore();

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $entry->fresh()->load([
                    'client', 
                    'vehicleType', 
                    'vehicle', 
                    'nonmotorPolicyType', 
                    'nonmotorPolicySubtype',
                    'adviser',
                    'insuranceCompany',
                    'bank',
                ]),
                'message' => 'GIC entry restored successfully.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('GIC entry restore error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore GIC entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get only trashed GIC entries.
     */
    public function trashed(Request $request)
    {
        try {
            $query = GicEntry::onlyTrashed()->with([
                'client', 
                'vehicleType', 
                'vehicle', 
                'nonmotorPolicyType', 
                'nonmotorPolicySubtype',
                'adviser',
                'insuranceCompany',
                'bank',
            ]);

            // Search filter for trashed entries
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->whereHas('client', function($clientQuery) use ($search) {
                         $clientQuery->where('client_name', 'like', "%{$search}%");
                     })
                      ->orWhere('policy_num', 'like', "%{$search}%")
                      ->orWhere('reg_num', 'like', "%{$search}%")
                      ->orWhere('mv_num', 'like', "%{$search}%");
                });
            }

            $entries = $query->latest()->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $entries,
                'message' => 'Trashed GIC entries retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            Log::error('Get trashed GIC entries error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve trashed GIC entries.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk restore GIC entries.
     */
    public function bulkRestore(Request $request)
    {
        try {
            DB::beginTransaction();

            $validator = Validator::make($request->all(), [
                'ids' => 'required|array',
                'ids.*' => 'exists:gic_entries,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $restoredCount = GicEntry::withTrashed()
                ->whereIn('id', $request->ids)
                ->restore();

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'restored_count' => $restoredCount
                ],
                'message' => "{$restoredCount} GIC entries restored successfully."
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bulk restore GIC entries error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to bulk restore GIC entries.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk force delete GIC entries.
     */
    public function bulkForceDelete(Request $request)
    {
        try {
            DB::beginTransaction();

            $validator = Validator::make($request->all(), [
                'ids' => 'required|array',
                'ids.*' => 'exists:gic_entries,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $deletedCount = GicEntry::withTrashed()
                ->whereIn('id', $request->ids)
                ->forceDelete();

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'deleted_count' => $deletedCount
                ],
                'message' => "{$deletedCount} GIC entries permanently deleted successfully."
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bulk force delete GIC entries error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to bulk permanently delete GIC entries.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dropdown options for GIC entry form
     */
    public function getDropdownOptions()
    {
        try {
            $options = [
                'vehicle_types' => DropdownOption::getVehicleTypes(),
                'vehicles' => DropdownOption::getVehicles(),
                'nonmotor_policy_types' => DropdownOption::getNonmotorPolicyTypes(),
                'nonmotor_policy_subtypes' => DropdownOption::getNonmotorPolicySubtypes(),
                'advisers' => DropdownOption::getAdvisers(),
                'insurance_companies' => DropdownOption::getInsuranceCompanies(),
                'banks' => DropdownOption::getBanks(),
                'branches' => DropdownOption::getBranches(),
            ];

            return response()->json([
                'success' => true,
                'data' => $options,
                'message' => 'Dropdown options retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve dropdown options.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get GIC entry by registration number
     */
    public function getByRegNum($regNum)
    {
        try {
            $entry = GicEntry::with([
                'client', 
                'vehicleType', 
                'vehicle', 
                'nonmotorPolicyType', 
                'nonmotorPolicySubtype',
                'adviser',
                'insuranceCompany',
                'bank',
            ])
                ->where('reg_num', $regNum)
                ->first();

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'GIC entry not found.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $entry,
                'message' => 'GIC entry retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve GIC entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get GIC entries by policy number
     */
    public function getByPolicyNum($policyNum)
    {
        try {
            $entries = GicEntry::with([
                'client', 
                'vehicleType', 
                'vehicle', 
                'nonmotorPolicyType', 
                'nonmotorPolicySubtype',
                'adviser',
                'insuranceCompany',
                'bank',
            ])
                ->where('policy_num', 'like', "%{$policyNum}%")
                ->latest()
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $entries,
                'message' => 'GIC entries retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve GIC entries.',
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
            $totalEntries = GicEntry::count();
            $motorEntries = GicEntry::motor()->count();
            $nonmotorEntries = GicEntry::nonmotor()->count();
            $pendingEntries = GicEntry::pending()->count();
            $completeEntries = GicEntry::complete()->count();
            
            $entriesByStatus = GicEntry::groupBy('form_status')
                ->selectRaw('form_status, count(*) as count')
                ->get();

            $totalPremium = GicEntry::sum('premium_amt');
            $totalAdvance = GicEntry::sum('adv_amt');

            $currentYear = date('Y');
            $currentMonth = date('n');
            $financialYear = $currentMonth >= 4 ? $currentYear : $currentYear - 1;
            
            $nextRegNum = GicEntry::byFinancialYear($financialYear)->max('reg_num');
            $nextRegNum = $nextRegNum ? $nextRegNum + 1 : 1;

            return response()->json([
                'success' => true,
                'data' => [
                    'total_entries' => $totalEntries,
                    'motor_entries' => $motorEntries,
                    'nonmotor_entries' => $nonmotorEntries,
                    'pending_entries' => $pendingEntries,
                    'complete_entries' => $completeEntries,
                    'entries_by_status' => $entriesByStatus,
                    'total_premium' => $totalPremium,
                    'total_advance' => $totalAdvance,
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
     * Get GIC entries by client
     */
    public function getByClient($clientId)
    {
        try {
            $entries = GicEntry::with([
                'vehicleType', 
                'vehicle', 
                'nonmotorPolicyType', 
                'nonmotorPolicySubtype',
                'adviser',
                'insuranceCompany'
            ])
                ->where('client_id', $clientId)
                ->latest()
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $entries,
                'message' => 'Client GIC entries retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve client GIC entries.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}