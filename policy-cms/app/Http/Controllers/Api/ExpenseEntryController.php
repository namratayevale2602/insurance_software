<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExpenseEntry;
use App\Models\DropdownOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ExpenseEntryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = ExpenseEntry::with([
                'expenseType',
                'bank',
                'branch',
                'mvNum',
                'internetProvider',
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
                    $q->where('person_name', 'like', "%{$search}%")
                      ->orWhere('user_name', 'like', "%{$search}%")
                      ->orWhere('consumer_number', 'like', "%{$search}%")
                      ->orWhere('telephone_number', 'like', "%{$search}%")
                      ->orWhere('internet_consumer_num', 'like', "%{$search}%")
                      ->orWhere('reg_num', 'like', "%{$search}%")
                      ->orWhere('remark', 'like', "%{$search}%");
                });
            }

            // Expense type filter
            if ($request->has('expense_type_id')) {
                $query->where('expense_type_id', $request->expense_type_id);
            }

            // Expense status filter
            if ($request->has('expense_status')) {
                $query->where('expense_status', $request->expense_status);
            }

            // Year filter
            if ($request->has('year')) {
                $query->whereYear('date', $request->year);
            }

            // Month filter
            if ($request->has('month')) {
                $month = date('m', strtotime($request->month));
                $year = date('Y', strtotime($request->month));
                $query->whereYear('date', $year)->whereMonth('date', $month);
            }

            $entries = $query->latest()->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $entries,
                'message' => 'Expense entries retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve expense entries.',
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
            
            Log::info('Expense Entry store method called', $request->all());

            // Base validation rules for all entries
            $baseRules = [
                'date' => 'required|date',
                'time' => 'required|date_format:H:i',
                'amount' => 'required|numeric|min:0',
                'pay_mode' => 'required|in:CASH,CHEQUE,PAYMENT LINK,ONLINE,RTGS/NEFT',
                'expense_status' => 'required|in:GENRAL,FIX',
                'expense_type_id' => 'required|exists:dropdown_options,id',
                'remark' => 'nullable|string',
            ];

            // Conditional rules for cheque payment
            $chequeRules = [];
            if ($request->pay_mode === 'CHEQUE') {
                $chequeRules = [
                    'cheque_num' => 'required|string|max:50',
                    'bank_name_id' => 'required|exists:dropdown_options,id',
                    'branch_name_id' => 'required|exists:dropdown_options,id',
                    'cheque_dt' => 'required|date',
                ];
            }

            // Get expense type to determine conditional validation
            $expenseType = DropdownOption::find($request->expense_type_id);
            $expenseTypeName = $expenseType ? strtoupper($expenseType->option_name) : '';

            // Conditional rules based on expense type
            $typeSpecificRules = [];
            
            if (str_contains($expenseTypeName, 'FUEL')) {
                $typeSpecificRules = [
                    'mv_num_id' => 'required|exists:dropdown_options,id',
                    'vehicle_type' => 'required|string|max:100',
                    'km' => 'required|integer|min:0',
                    'user_name' => 'required|string|max:255',
                    'fuel_type' => 'required|in:PETROL,DISEL,CNG',
                    'liter' => 'required|numeric|min:0',
                    
                    // Other type fields should not be present
                    'salary_month_year' => 'prohibited',
                    'person_name' => 'prohibited',
                    'mseb_month_year' => 'prohibited',
                    'consumer_number' => 'prohibited',
                    'telephone_month_year' => 'prohibited',
                    'telephone_number' => 'prohibited',
                    'internet_month_year' => 'prohibited',
                    'internet_provider_id' => 'prohibited',
                    'internet_consumer_num' => 'prohibited',
                    'internet_referance' => 'prohibited',
                ];
            } else if (str_contains($expenseTypeName, 'SALARY')) {
                $typeSpecificRules = [
                    'salary_month_year' => 'required|string|max:50',
                    'person_name' => 'required|string|max:255',
                    
                    // Other type fields should not be present
                    'mv_num_id' => 'prohibited',
                    'vehicle_type' => 'prohibited',
                    'km' => 'prohibited',
                    'user_name' => 'prohibited',
                    'fuel_type' => 'prohibited',
                    'liter' => 'prohibited',
                    'mseb_month_year' => 'prohibited',
                    'consumer_number' => 'prohibited',
                    'telephone_month_year' => 'prohibited',
                    'telephone_number' => 'prohibited',
                    'internet_month_year' => 'prohibited',
                    'internet_provider_id' => 'prohibited',
                    'internet_consumer_num' => 'prohibited',
                    'internet_referance' => 'prohibited',
                ];
            } else if (str_contains($expenseTypeName, 'MSEB') || str_contains($expenseTypeName, 'ELECTRICITY')) {
                $typeSpecificRules = [
                    'mseb_month_year' => 'required|string|max:50',
                    'consumer_number' => 'required|string|max:100',
                    
                    // Other type fields should not be present
                    'mv_num_id' => 'prohibited',
                    'vehicle_type' => 'prohibited',
                    'km' => 'prohibited',
                    'user_name' => 'prohibited',
                    'fuel_type' => 'prohibited',
                    'liter' => 'prohibited',
                    'salary_month_year' => 'prohibited',
                    'person_name' => 'prohibited',
                    'telephone_month_year' => 'prohibited',
                    'telephone_number' => 'prohibited',
                    'internet_month_year' => 'prohibited',
                    'internet_provider_id' => 'prohibited',
                    'internet_consumer_num' => 'prohibited',
                    'internet_referance' => 'prohibited',
                ];
            } else if (str_contains($expenseTypeName, 'TELEPHONE')) {
                $typeSpecificRules = [
                    'telephone_month_year' => 'required|string|max:50',
                    'telephone_number' => 'required|string|max:20',
                    
                    // Other type fields should not be present
                    'mv_num_id' => 'prohibited',
                    'vehicle_type' => 'prohibited',
                    'km' => 'prohibited',
                    'user_name' => 'prohibited',
                    'fuel_type' => 'prohibited',
                    'liter' => 'prohibited',
                    'salary_month_year' => 'prohibited',
                    'person_name' => 'prohibited',
                    'mseb_month_year' => 'prohibited',
                    'consumer_number' => 'prohibited',
                    'internet_month_year' => 'prohibited',
                    'internet_provider_id' => 'prohibited',
                    'internet_consumer_num' => 'prohibited',
                    'internet_referance' => 'prohibited',
                ];
            } else if (str_contains($expenseTypeName, 'INTERNET')) {
                $typeSpecificRules = [
                    'internet_month_year' => 'required|string|max:50',
                    'internet_provider_id' => 'required|exists:dropdown_options,id',
                    'internet_consumer_num' => 'required|string|max:100',
                    'internet_referance' => 'nullable|string|max:255',
                    
                    // Other type fields should not be present
                    'mv_num_id' => 'prohibited',
                    'vehicle_type' => 'prohibited',
                    'km' => 'prohibited',
                    'user_name' => 'prohibited',
                    'fuel_type' => 'prohibited',
                    'liter' => 'prohibited',
                    'salary_month_year' => 'prohibited',
                    'person_name' => 'prohibited',
                    'mseb_month_year' => 'prohibited',
                    'consumer_number' => 'prohibited',
                    'telephone_month_year' => 'prohibited',
                    'telephone_number' => 'prohibited',
                ];
            } else {
                // General expense - prohibit all specific fields
                $typeSpecificRules = [
                    'mv_num_id' => 'prohibited',
                    'vehicle_type' => 'prohibited',
                    'km' => 'prohibited',
                    'user_name' => 'prohibited',
                    'fuel_type' => 'prohibited',
                    'liter' => 'prohibited',
                    'salary_month_year' => 'prohibited',
                    'person_name' => 'prohibited',
                    'mseb_month_year' => 'prohibited',
                    'consumer_number' => 'prohibited',
                    'telephone_month_year' => 'prohibited',
                    'telephone_number' => 'prohibited',
                    'internet_month_year' => 'prohibited',
                    'internet_provider_id' => 'prohibited',
                    'internet_consumer_num' => 'prohibited',
                    'internet_referance' => 'prohibited',
                ];
            }

            $validator = Validator::make($request->all(), array_merge($baseRules, $chequeRules, $typeSpecificRules));

            if ($validator->fails()) {
                Log::error('Validation failed', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validatedData = $validator->validated();

            // Pre-process data based on expense type BEFORE creating the model
            $processedData = $this->preprocessData($validatedData, $expenseTypeName);

            Log::info('Creating expense entry with processed data:', $processedData);

            $expenseEntry = ExpenseEntry::create($processedData);

            Log::info('Expense entry created successfully', ['expense_entry_id' => $expenseEntry->id]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $expenseEntry->load([
                    'expenseType',
                    'bank',
                    'branch',
                    'mvNum',
                    'internetProvider',
                ]),
                'message' => 'Expense entry created successfully.'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Expense entry creation error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create expense entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Pre-process data based on expense type
     */
    private function preprocessData(array $data, string $expenseTypeName): array
    {
        if (!str_contains($expenseTypeName, 'FUEL')) {
            unset($data['mv_num_id']);
            unset($data['vehicle_type']);
            unset($data['km']);
            unset($data['user_name']);
            unset($data['fuel_type']);
            unset($data['liter']);
        }

        if (!str_contains($expenseTypeName, 'SALARY')) {
            unset($data['salary_month_year']);
            unset($data['person_name']);
        }

        if (!str_contains($expenseTypeName, 'MSEB') && !str_contains($expenseTypeName, 'ELECTRICITY')) {
            unset($data['mseb_month_year']);
            unset($data['consumer_number']);
        }

        if (!str_contains($expenseTypeName, 'TELEPHONE')) {
            unset($data['telephone_month_year']);
            unset($data['telephone_number']);
        }

        if (!str_contains($expenseTypeName, 'INTERNET')) {
            unset($data['internet_month_year']);
            unset($data['internet_provider_id']);
            unset($data['internet_consumer_num']);
            unset($data['internet_referance']);
        }

        return $data;
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $entry = ExpenseEntry::with([
                'expenseType',
                'bank',
                'branch',
                'mvNum',
                'internetProvider',
            ])->find($id);

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'Expense entry not found.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $entry,
                'message' => 'Expense entry retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve expense entry.',
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

            $entry = ExpenseEntry::find($id);

            if (!$entry) {
                Log::error('Expense entry not found', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Expense entry not found.'
                ], 404);
            }

            Log::info('Found entry', ['entry' => $entry->toArray()]);

            // Base validation rules
            $baseRules = [
                'date' => 'sometimes|date',
                'time' => 'sometimes|date_format:H:i',
                'amount' => 'sometimes|numeric|min:0',
                'pay_mode' => 'sometimes|in:CASH,CHEQUE,PAYMENT LINK,ONLINE,RTGS/NEFT',
                'expense_status' => 'sometimes|in:GENRAL,FIX',
                'expense_type_id' => 'sometimes|exists:dropdown_options,id',
                'remark' => 'nullable|string',
            ];

            // Determine current expense type for validation
            $expenseTypeId = $request->has('expense_type_id') ? $request->expense_type_id : $entry->expense_type_id;
            $expenseType = DropdownOption::find($expenseTypeId);
            $expenseTypeName = $expenseType ? strtoupper($expenseType->option_name) : '';

            // Conditional rules for cheque payment
            $chequeRules = [];
            $payMode = $request->has('pay_mode') ? $request->pay_mode : $entry->pay_mode;
            if ($payMode === 'CHEQUE') {
                $chequeRules = [
                    'cheque_num' => 'required_with:pay_mode|string|max:50',
                    'bank_name_id' => 'required_with:pay_mode|exists:dropdown_options,id',
                    'branch_name_id' => 'required_with:pay_mode|exists:dropdown_options,id',
                    'cheque_dt' => 'required_with:pay_mode|date',
                ];
            }

            // Conditional rules based on expense type
            $typeSpecificRules = [];
            
            if (str_contains($expenseTypeName, 'FUEL')) {
                $typeSpecificRules = [
                    'mv_num_id' => 'required_with:expense_type_id|exists:dropdown_options,id',
                    'vehicle_type' => 'required_with:expense_type_id|string|max:100',
                    'km' => 'required_with:expense_type_id|integer|min:0',
                    'user_name' => 'required_with:expense_type_id|string|max:255',
                    'fuel_type' => 'required_with:expense_type_id|in:PETROL,DISEL,CNG',
                    'liter' => 'required_with:expense_type_id|numeric|min:0',
                    
                    // Other type fields should not be present
                    'salary_month_year' => 'prohibited',
                    'person_name' => 'prohibited',
                    'mseb_month_year' => 'prohibited',
                    'consumer_number' => 'prohibited',
                    'telephone_month_year' => 'prohibited',
                    'telephone_number' => 'prohibited',
                    'internet_month_year' => 'prohibited',
                    'internet_provider_id' => 'prohibited',
                    'internet_consumer_num' => 'prohibited',
                    'internet_referance' => 'prohibited',
                ];
            } else if (str_contains($expenseTypeName, 'SALARY')) {
                $typeSpecificRules = [
                    'salary_month_year' => 'required_with:expense_type_id|string|max:50',
                    'person_name' => 'required_with:expense_type_id|string|max:255',
                    
                    // Other type fields should not be present
                    'mv_num_id' => 'prohibited',
                    'vehicle_type' => 'prohibited',
                    'km' => 'prohibited',
                    'user_name' => 'prohibited',
                    'fuel_type' => 'prohibited',
                    'liter' => 'prohibited',
                    'mseb_month_year' => 'prohibited',
                    'consumer_number' => 'prohibited',
                    'telephone_month_year' => 'prohibited',
                    'telephone_number' => 'prohibited',
                    'internet_month_year' => 'prohibited',
                    'internet_provider_id' => 'prohibited',
                    'internet_consumer_num' => 'prohibited',
                    'internet_referance' => 'prohibited',
                ];
            } else if (str_contains($expenseTypeName, 'MSEB') || str_contains($expenseTypeName, 'ELECTRICITY')) {
                $typeSpecificRules = [
                    'mseb_month_year' => 'required_with:expense_type_id|string|max:50',
                    'consumer_number' => 'required_with:expense_type_id|string|max:100',
                    
                    // Other type fields should not be present
                    'mv_num_id' => 'prohibited',
                    'vehicle_type' => 'prohibited',
                    'km' => 'prohibited',
                    'user_name' => 'prohibited',
                    'fuel_type' => 'prohibited',
                    'liter' => 'prohibited',
                    'salary_month_year' => 'prohibited',
                    'person_name' => 'prohibited',
                    'telephone_month_year' => 'prohibited',
                    'telephone_number' => 'prohibited',
                    'internet_month_year' => 'prohibited',
                    'internet_provider_id' => 'prohibited',
                    'internet_consumer_num' => 'prohibited',
                    'internet_referance' => 'prohibited',
                ];
            } else if (str_contains($expenseTypeName, 'TELEPHONE')) {
                $typeSpecificRules = [
                    'telephone_month_year' => 'required_with:expense_type_id|string|max:50',
                    'telephone_number' => 'required_with:expense_type_id|string|max:20',
                    
                    // Other type fields should not be present
                    'mv_num_id' => 'prohibited',
                    'vehicle_type' => 'prohibited',
                    'km' => 'prohibited',
                    'user_name' => 'prohibited',
                    'fuel_type' => 'prohibited',
                    'liter' => 'prohibited',
                    'salary_month_year' => 'prohibited',
                    'person_name' => 'prohibited',
                    'mseb_month_year' => 'prohibited',
                    'consumer_number' => 'prohibited',
                    'internet_month_year' => 'prohibited',
                    'internet_provider_id' => 'prohibited',
                    'internet_consumer_num' => 'prohibited',
                    'internet_referance' => 'prohibited',
                ];
            } else if (str_contains($expenseTypeName, 'INTERNET')) {
                $typeSpecificRules = [
                    'internet_month_year' => 'required_with:expense_type_id|string|max:50',
                    'internet_provider_id' => 'required_with:expense_type_id|exists:dropdown_options,id',
                    'internet_consumer_num' => 'required_with:expense_type_id|string|max:100',
                    'internet_referance' => 'nullable|string|max:255',
                    
                    // Other type fields should not be present
                    'mv_num_id' => 'prohibited',
                    'vehicle_type' => 'prohibited',
                    'km' => 'prohibited',
                    'user_name' => 'prohibited',
                    'fuel_type' => 'prohibited',
                    'liter' => 'prohibited',
                    'salary_month_year' => 'prohibited',
                    'person_name' => 'prohibited',
                    'mseb_month_year' => 'prohibited',
                    'consumer_number' => 'prohibited',
                    'telephone_month_year' => 'prohibited',
                    'telephone_number' => 'prohibited',
                ];
            } else {
                // General expense - prohibit all specific fields
                $typeSpecificRules = [
                    'mv_num_id' => 'prohibited',
                    'vehicle_type' => 'prohibited',
                    'km' => 'prohibited',
                    'user_name' => 'prohibited',
                    'fuel_type' => 'prohibited',
                    'liter' => 'prohibited',
                    'salary_month_year' => 'prohibited',
                    'person_name' => 'prohibited',
                    'mseb_month_year' => 'prohibited',
                    'consumer_number' => 'prohibited',
                    'telephone_month_year' => 'prohibited',
                    'telephone_number' => 'prohibited',
                    'internet_month_year' => 'prohibited',
                    'internet_provider_id' => 'prohibited',
                    'internet_consumer_num' => 'prohibited',
                    'internet_referance' => 'prohibited',
                ];
            }

            $validator = Validator::make($request->all(), array_merge($baseRules, $chequeRules, $typeSpecificRules));

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
            $processedData = $this->preprocessData($validatedData, $expenseTypeName);

            Log::info('Data before update', $processedData);
            
            $updated = $entry->update($processedData);
            
            Log::info('Update result', ['updated' => $updated, 'entry_after' => $entry->fresh()->toArray()]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $entry->fresh()->load([
                    'expenseType',
                    'bank',
                    'branch',
                    'mvNum',
                    'internetProvider',
                ]),
                'message' => 'Expense entry updated successfully.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update expense entry.',
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
            $entry = ExpenseEntry::find($id);

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'Expense entry not found.'
                ], 404);
            }

            $entry->delete();

            return response()->json([
                'success' => true,
                'message' => 'Expense entry deleted successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete expense entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore a soft deleted expense entry.
     */
    public function restore($id)
    {
        try {
            $entry = ExpenseEntry::withTrashed()->find($id);

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'Expense entry not found.'
                ], 404);
            }

            if (!$entry->trashed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Expense entry is not deleted.'
                ], 400);
            }

            $entry->restore();

            return response()->json([
                'success' => true,
                'data' => $entry->fresh()->load([
                    'expenseType',
                    'bank',
                    'branch',
                    'mvNum',
                    'internetProvider',
                ]),
                'message' => 'Expense entry restored successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore expense entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Permanently delete an expense entry.
     */
    public function forceDelete($id)
    {
        try {
            $entry = ExpenseEntry::withTrashed()->find($id);

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'Expense entry not found.'
                ], 404);
            }

            $entry->forceDelete();

            return response()->json([
                'success' => true,
                'message' => 'Expense entry permanently deleted successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to permanently delete expense entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get expense entry by registration number
     */
    public function getByRegNum($regNum)
    {
        try {
            $entry = ExpenseEntry::with([
                'expenseType',
                'bank',
                'branch',
                'mvNum',
                'internetProvider',
            ])
                ->where('reg_num', $regNum)
                ->first();

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'Expense entry not found.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $entry,
                'message' => 'Expense entry retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve expense entry.',
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
            $totalEntries = ExpenseEntry::count();
            $generalEntries = ExpenseEntry::general()->count();
            $fixEntries = ExpenseEntry::fix()->count();
            $deletedEntries = ExpenseEntry::onlyTrashed()->count();
            
            $totalAmount = ExpenseEntry::sum('amount');
            $generalAmount = ExpenseEntry::general()->sum('amount');
            $fixAmount = ExpenseEntry::fix()->sum('amount');

            $currentYear = date('Y');
            
            $nextRegNum = ExpenseEntry::whereYear('date', $currentYear)->max('reg_num');
            $nextRegNum = $nextRegNum ? $nextRegNum + 1 : 1;

            return response()->json([
                'success' => true,
                'data' => [
                    'total_entries' => $totalEntries,
                    'general_entries' => $generalEntries,
                    'fix_entries' => $fixEntries,
                    'deleted_entries' => $deletedEntries,
                    'total_amount' => $totalAmount,
                    'general_amount' => $generalAmount,
                    'fix_amount' => $fixAmount,
                    'current_year' => $currentYear,
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
     * Get expense summary by type
     */
    public function getSummaryByType(Request $request)
    {
        try {
            $query = ExpenseEntry::with('expenseType')
                ->select('expense_type_id', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total_amount'))
                ->groupBy('expense_type_id');

            if ($request->has('year')) {
                $query->whereYear('date', $request->year);
            }

            if ($request->has('month')) {
                $month = date('m', strtotime($request->month));
                $year = date('Y', strtotime($request->month));
                $query->whereYear('date', $year)->whereMonth('date', $month);
            }

            $summary = $query->get();

            return response()->json([
                'success' => true,
                'data' => $summary,
                'message' => 'Expense summary by type retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve expense summary.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}