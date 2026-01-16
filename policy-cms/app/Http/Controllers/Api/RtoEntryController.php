<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RtoEntry;
use App\Models\Client;
use App\Models\DropdownOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RtoEntryController extends Controller
{
     /**
     * Display a listing of the resource with comprehensive filters
     */
    public function index(Request $request)
    {
        try {
            $query = RtoEntry::with([
                'client', 
                'client.city',
                'ntTypeWork',
                'trTypeWork',
                'dlTypeWork',
                'vehicleClass',
            ]);

            // Include trashed records if requested
            if ($request->has('with_trashed') && $request->with_trashed) {
                $query->withTrashed();
            }

            // Show only trashed records if requested
            if ($request->has('only_trashed') && $request->only_trashed) {
                $query->onlyTrashed();
            }

            // ========== SEARCH FILTERS ==========
            // General search across multiple fields
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->whereHas('client', function($clientQuery) use ($search) {
                        $clientQuery->where('client_name', 'like', "%{$search}%")
                            ->orWhere('contact', 'like', "%{$search}%");
                    })
                    ->orWhere('mv_num', 'like', "%{$search}%")
                    ->orWhere('reg_num', 'like', "%{$search}%")
                    ->orWhere('adviser_name', 'like', "%{$search}%")
                    ->orWhere('remark', 'like', "%{$search}%");
                });
            }

            // Client name specific filter
            if ($request->has('client_name')) {
                $query->whereHas('client', function($q) use ($request) {
                    $q->where('client_name', 'like', "%{$request->client_name}%");
                });
            }

            // Client contact specific filter
            if ($request->has('client_contact')) {
                $query->whereHas('client', function($q) use ($request) {
                    $q->where('contact', 'like', "%{$request->client_contact}%");
                });
            }

            // Registration number filter
            if ($request->has('reg_num')) {
                $query->where('reg_num', $request->reg_num);
            }

            // MV number filter
            if ($request->has('mv_num')) {
                $query->where('mv_num', 'like', "%{$request->mv_num}%");
            }

            // ========== CATEGORY & TYPE FILTERS ==========
            // Category filter
            if ($request->has('category')) {
                $query->where('category', $request->category);
            }

            // NT type work filter
            if ($request->has('nt_type_work_id')) {
                $query->where('nt_type_work_id', $request->nt_type_work_id);
            }

            // TR type work filter
            if ($request->has('tr_type_work_id')) {
                $query->where('tr_type_work_id', $request->tr_type_work_id);
            }

            // DL type work filter
            if ($request->has('dl_type_work_id')) {
                $query->where('dl_type_work_id', $request->dl_type_work_id);
            }

            // Vehicle class filter
            if ($request->has('vehicle_class_id')) {
                $query->where('vehicle_class_id', $request->vehicle_class_id);
            }

            // ========== STATUS FILTER ==========
            // Form status filter
            if ($request->has('form_status')) {
                $query->where('form_status', $request->form_status);
            }

            // ========== DATE RANGE FILTERS ==========
            // Date range filter
            if ($request->has('date_from') && $request->has('date_to')) {
                $query->whereBetween('date', [
                    $request->date_from,
                    $request->date_to
                ]);
            } elseif ($request->has('date_from')) {
                $query->where('date', '>=', $request->date_from);
            } elseif ($request->has('date_to')) {
                $query->where('date', '<=', $request->date_to);
            }

            // Month filter
            if ($request->has('month')) {
                $month = date('m', strtotime($request->month));
                $year = date('Y', strtotime($request->month));
                $query->whereYear('date', $year)->whereMonth('date', $month);
            }

            // ========== AMOUNT FILTERS ==========
            // Premium amount range
            if ($request->has('premium_from') && $request->has('premium_to')) {
                $query->whereBetween('premium_amt', [
                    $request->premium_from,
                    $request->premium_to
                ]);
            } elseif ($request->has('premium_from')) {
                $query->where('premium_amt', '>=', $request->premium_from);
            } elseif ($request->has('premium_to')) {
                $query->where('premium_amt', '<=', $request->premium_to);
            }

            // Advance amount range
            if ($request->has('advance_from') && $request->has('advance_to')) {
                $query->whereBetween('adv_amt', [
                    $request->advance_from,
                    $request->advance_to
                ]);
            }

            // Government fee range
            if ($request->has('gov_fee_from') && $request->has('gov_fee_to')) {
                $query->whereBetween('gov_fee', [
                    $request->gov_fee_from,
                    $request->gov_fee_to
                ]);
            }

            // ========== SORTING ==========
            // Default sorting
            $sortBy = $request->has('sort_by') ? $request->sort_by : 'created_at';
            $sortOrder = $request->has('sort_order') ? $request->sort_order : 'desc';

            // Validate sort fields
            $validSortFields = [
                'reg_num', 'date', 'premium_amt', 'adv_amt', 'gov_fee',
                'created_at', 'updated_at', 'client_name', 'mv_num'
            ];

            if (in_array($sortBy, $validSortFields)) {
                if ($sortBy === 'client_name') {
                    $query->leftJoin('client', 'rto_entries.client_id', '=', 'client.id')
                          ->orderBy('client.client_name', $sortOrder)
                          ->select('rto_entries.*');
                } else {
                    $query->orderBy($sortBy, $sortOrder);
                }
            } else {
                $query->latest();
            }

            // ========== PAGINATION ==========
            $perPage = $request->has('per_page') ? min($request->per_page, 100) : 10;
            $entries = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $entries,
                'message' => 'RTO entries retrieved successfully.',
                'filters' => [
                    'applied' => $request->except(['page', 'per_page', 'sort_by', 'sort_order']),
                    'sort_by' => $sortBy,
                    'sort_order' => $sortOrder
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve RTO entries: ' . $e->getMessage(), [
                'request' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve RTO entries.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get filter options for RTO entries
     */
    public function getFilterOptions(Request $request)
    {
        try {
            $options = [
                'categories' => ['NT', 'TR', 'DL'],
                'form_statuses' => ['PENDING', 'COMPLETE'],
                
                'nt_type_works' => DropdownOption::where('category', 'nt_type_work')->get(),
                'tr_type_works' => DropdownOption::where('category', 'tr_type_work')->get(),
                'dl_type_works' => DropdownOption::where('category', 'dl_type_work')->get(),
                'vehicle_classes' => DropdownOption::where('category', 'vehicle_cls')->get(),

                // Get unique years and months for quick filters
                'unique_years' => RtoEntry::select(DB::raw('YEAR(date) as year'))
                    ->distinct()
                    ->orderBy('year', 'desc')
                    ->pluck('year'),
                
                'unique_months' => $this->getUniqueMonths(),
            ];

            // Get stats for dashboard
            $stats = [
                'total' => RtoEntry::count(),
                'nt' => RtoEntry::nt()->count(),
                'tr' => RtoEntry::tr()->count(),
                'dl' => RtoEntry::dl()->count(),
                'pending' => RtoEntry::pending()->count(),
                'complete' => RtoEntry::complete()->count(),
                'deleted' => RtoEntry::onlyTrashed()->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'filter_options' => $options,
                    'stats' => $stats
                ],
                'message' => 'Filter options retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get filter options: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve filter options.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get unique months from data
     */
    private function getUniqueMonths()
    {
        $entries = RtoEntry::select('date')->get();
        $months = [];
        
        foreach ($entries as $entry) {
            $monthYear = $entry->date->format('Y-m');
            if (!in_array($monthYear, $months)) {
                $months[] = $monthYear;
            }
        }
        
        rsort($months);
        return $months;
    }

    /**
     * Get RTO entries with comprehensive filtering
     */
    public function getFilteredEntries(Request $request)
    {
        try {
            $query = RtoEntry::with([
                'client', 
                'client.city',
                'ntTypeWork',
                'trTypeWork',
                'dlTypeWork',
                'vehicleClass',
            ]);

            // Apply filters
            $this->applyFilters($query, $request);

            // Sorting
            $sortBy = $request->has('sort_by') ? $request->sort_by : 'created_at';
            $sortOrder = $request->has('sort_order') ? $request->sort_order : 'desc';

            $validSortFields = ['reg_num', 'date', 'created_at', 'updated_at', 'client_name', 'mv_num'];
            if (in_array($sortBy, $validSortFields)) {
                if ($sortBy === 'client_name') {
                    $query->leftJoin('client', 'rto_entries.client_id', '=', 'client.id')
                          ->orderBy('client.client_name', $sortOrder)
                          ->select('rto_entries.*');
                } else {
                    $query->orderBy($sortBy, $sortOrder);
                }
            } else {
                $query->latest();
            }

            // Pagination
            $perPage = $request->has('per_page') ? min($request->per_page, 100) : 10;
            $entries = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $entries,
                'message' => 'RTO entries retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve filtered RTO entries: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve RTO entries.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Apply common filters to query
     */
    private function applyFilters($query, $request)
    {
        // Client filters
        if ($request->has('client_name')) {
            $query->whereHas('client', function($q) use ($request) {
                $q->where('client_name', 'like', "%{$request->client_name}%");
            });
        }

        if ($request->has('client_contact')) {
            $query->whereHas('client', function($q) use ($request) {
                $q->where('contact', 'like', "%{$request->client_contact}%");
            });
        }

        // Registration and MV number filters
        if ($request->has('reg_num')) {
            $query->where('reg_num', $request->reg_num);
        }

        if ($request->has('mv_num')) {
            $query->where('mv_num', 'like', "%{$request->mv_num}%");
        }

        // Category and type filters
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('nt_type_work_id')) {
            $query->where('nt_type_work_id', $request->nt_type_work_id);
        }

        if ($request->has('tr_type_work_id')) {
            $query->where('tr_type_work_id', $request->tr_type_work_id);
        }

        if ($request->has('dl_type_work_id')) {
            $query->where('dl_type_work_id', $request->dl_type_work_id);
        }

        if ($request->has('vehicle_class_id')) {
            $query->where('vehicle_class_id', $request->vehicle_class_id);
        }

        // Status filter
        if ($request->has('form_status')) {
            $query->where('form_status', $request->form_status);
        }

        // Date range filter
        if ($request->has('date_from') && $request->has('date_to')) {
            $query->whereBetween('date', [
                $request->date_from,
                $request->date_to
            ]);
        } elseif ($request->has('date_from')) {
            $query->where('date', '>=', $request->date_from);
        } elseif ($request->has('date_to')) {
            $query->where('date', '<=', $request->date_to);
        }

        // Amount filters
        if ($request->has('premium_from') && $request->has('premium_to')) {
            $query->whereBetween('premium_amt', [
                $request->premium_from,
                $request->premium_to
            ]);
        }

        if ($request->has('advance_from') && $request->has('advance_to')) {
            $query->whereBetween('adv_amt', [
                $request->advance_from,
                $request->advance_to
            ]);
        }

        if ($request->has('gov_fee_from') && $request->has('gov_fee_to')) {
            $query->whereBetween('gov_fee', [
                $request->gov_fee_from,
                $request->gov_fee_to
            ]);
        }

        return $query;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            DB::beginTransaction();
            
            Log::info('RTO Entry store method called', $request->all());

            // Base validation rules for all entries
            $baseRules = [
                'client_id' => 'required|exists:client,id',
                'date' => 'required|date',
                'time' => 'required|date_format:H:i',
                'category' => 'required|in:NT,TR,DL',
                'vehicle_class_id' => 'nullable|exists:dropdown_options,id',
                'mv_num' => 'nullable|string|max:50',
                'premium_amt' => 'required|numeric|min:0',
                'adv_amt' => 'required|numeric|min:0',
                'recov_amt' => 'required|numeric|min:0',
                'gov_fee' => 'required|numeric|min:0',
                'cash_in_hand' => 'required|numeric|min:0',
                'expense_amt' => 'required|numeric|min:0',
                'new_amt' => 'required|numeric|min:0',
                'adviser_name' => 'nullable|string|max:255',
                'responsibility' => 'nullable|string|max:255',
                'remark' => 'nullable|string',
                'form_status' => 'required|in:PENDING,COMPLETE',
            ];

            // Conditional rules based on category
            $conditionalRules = [];
            
            if ($request->category === 'NT') {
                $conditionalRules = [
                    'nt_type_work_id' => 'required|exists:dropdown_options,id',
                    // TR and DL fields should not be present for NT
                    'tr_type_work_id' => 'prohibited',
                    'dl_type_work_id' => 'prohibited',
                ];
            } else if ($request->category === 'TR') {
                $conditionalRules = [
                    'tr_type_work_id' => 'required|exists:dropdown_options,id',
                    // NT and DL fields should not be present for TR
                    'nt_type_work_id' => 'prohibited',
                    'dl_type_work_id' => 'prohibited',
                ];
            } else if ($request->category === 'DL') {
                $conditionalRules = [
                    'dl_type_work_id' => 'required|exists:dropdown_options,id',
                    // NT and TR fields should not be present for DL
                    'nt_type_work_id' => 'prohibited',
                    'tr_type_work_id' => 'prohibited',
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

            // Pre-process data based on category BEFORE creating the model
            $processedData = $this->preprocessData($validatedData);

            Log::info('Creating RTO entry with processed data:', $processedData);

            $rtoEntry = RtoEntry::create($processedData);

            Log::info('RTO entry created successfully', ['rto_entry_id' => $rtoEntry->id]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $rtoEntry->load([
                    'client', 
                    'client.city',
                    'ntTypeWork',
                    'trTypeWork',
                    'dlTypeWork',
                    'vehicleClass',
                ]),
                'message' => 'RTO entry created successfully.'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('RTO entry creation error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create RTO entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Pre-process data based on category
     */
    private function preprocessData(array $data): array
    {
        if ($data['category'] === 'NT') {
            // Ensure TR and DL fields are not present
            unset($data['tr_type_work_id']);
            unset($data['dl_type_work_id']);
        } else if ($data['category'] === 'TR') {
            // Ensure NT and DL fields are not present
            unset($data['nt_type_work_id']);
            unset($data['dl_type_work_id']);
        } else if ($data['category'] === 'DL') {
            // Ensure NT and TR fields are not present
            unset($data['nt_type_work_id']);
            unset($data['tr_type_work_id']);
        }

        return $data;
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $entry = RtoEntry::with([
                'client', 
                'client.city',
                'ntTypeWork',
                'trTypeWork',
                'dlTypeWork',
                'vehicleClass',
            ])->find($id);

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'RTO entry not found.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $entry,
                'message' => 'RTO entry retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve RTO entry.',
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

            $entry = RtoEntry::find($id);

            if (!$entry) {
                Log::error('RTO entry not found', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'RTO entry not found.'
                ], 404);
            }

            Log::info('Found entry', ['entry' => $entry->toArray()]);

            // Base validation rules
            $baseRules = [
                'client_id' => 'sometimes|exists:client,id',
                'date' => 'sometimes|date',
                'time' => 'sometimes|date_format:H:i',
                'category' => 'sometimes|in:NT,TR,DL',
                'vehicle_class_id' => 'nullable|exists:dropdown_options,id',
                'mv_num' => 'nullable|string|max:50',
                'premium_amt' => 'sometimes|numeric|min:0',
                'adv_amt' => 'sometimes|numeric|min:0',
                'recov_amt' => 'sometimes|numeric|min:0',
                'gov_fee' => 'sometimes|numeric|min:0',
                'cash_in_hand' => 'sometimes|numeric|min:0',
                'expense_amt' => 'sometimes|numeric|min:0',
                'new_amt' => 'sometimes|numeric|min:0',
                'adviser_name' => 'nullable|string|max:255',
                'responsibility' => 'nullable|string|max:255',
                'remark' => 'nullable|string',
                'form_status' => 'sometimes|in:PENDING,COMPLETE',
            ];

            // Determine current category for validation
            $category = $request->has('category') ? $request->category : $entry->category;

            // Conditional rules based on category
            $conditionalRules = [];
            
            if ($category === 'NT') {
                $conditionalRules = [
                    'nt_type_work_id' => 'required_with:category|exists:dropdown_options,id',
                    // TR and DL fields should not be present for NT
                    'tr_type_work_id' => 'prohibited',
                    'dl_type_work_id' => 'prohibited',
                ];
            } else if ($category === 'TR') {
                $conditionalRules = [
                    'tr_type_work_id' => 'required_with:category|exists:dropdown_options,id',
                    // NT and DL fields should not be present for TR
                    'nt_type_work_id' => 'prohibited',
                    'dl_type_work_id' => 'prohibited',
                ];
            } else if ($category === 'DL') {
                $conditionalRules = [
                    'dl_type_work_id' => 'required_with:category|exists:dropdown_options,id',
                    // NT and TR fields should not be present for DL
                    'nt_type_work_id' => 'prohibited',
                    'tr_type_work_id' => 'prohibited',
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
                    'ntTypeWork',
                    'trTypeWork',
                    'dlTypeWork',
                    'vehicleClass',
                ]),
                'message' => 'RTO entry updated successfully.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update RTO entry.',
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
            $entry = RtoEntry::find($id);

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'RTO entry not found.'
                ], 404);
            }

            $entry->delete();

            return response()->json([
                'success' => true,
                'message' => 'RTO entry deleted successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete RTO entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore a soft deleted RTO entry.
     */
    public function restore($id)
    {
        try {
            $entry = RtoEntry::withTrashed()->find($id);

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'RTO entry not found.'
                ], 404);
            }

            if (!$entry->trashed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'RTO entry is not deleted.'
                ], 400);
            }

            $entry->restore();

            return response()->json([
                'success' => true,
                'data' => $entry->fresh()->load([
                    'client', 
                    'client.city',
                    'ntTypeWork',
                    'trTypeWork',
                    'dlTypeWork',
                    'vehicleClass',
                ]),
                'message' => 'RTO entry restored successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore RTO entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Permanently delete a RTO entry.
     */
    public function forceDelete($id)
    {
        try {
            $entry = RtoEntry::withTrashed()->find($id);

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'RTO entry not found.'
                ], 404);
            }

            $entry->forceDelete();

            return response()->json([
                'success' => true,
                'message' => 'RTO entry permanently deleted successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to permanently delete RTO entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get RTO entry by registration number
     */
    public function getByRegNum($regNum)
    {
        try {
            $entry = RtoEntry::with([
                'client', 
                'client.city',
                'ntTypeWork',
                'trTypeWork',
                'dlTypeWork',
                'vehicleClass',
            ])
                ->where('reg_num', $regNum)
                ->first();

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'RTO entry not found.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $entry,
                'message' => 'RTO entry retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve RTO entry.',
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
            $totalEntries = RtoEntry::count();
            $ntEntries = RtoEntry::nt()->count();
            $trEntries = RtoEntry::tr()->count();
            $dlEntries = RtoEntry::dl()->count();
            $pendingEntries = RtoEntry::pending()->count();
            $completeEntries = RtoEntry::complete()->count();
            $deletedEntries = RtoEntry::onlyTrashed()->count();
            
            $currentMonth = date('n');
            $currentYear = date('Y');
            
            $nextRegNum = RtoEntry::whereYear('date', $currentYear)
                ->whereMonth('date', $currentMonth)
                ->max('reg_num');
            $nextRegNum = $nextRegNum ? $nextRegNum + 1 : 1;

            return response()->json([
                'success' => true,
                'data' => [
                    'total_entries' => $totalEntries,
                    'nt_entries' => $ntEntries,
                    'tr_entries' => $trEntries,
                    'dl_entries' => $dlEntries,
                    'pending_entries' => $pendingEntries,
                    'complete_entries' => $completeEntries,
                    'deleted_entries' => $deletedEntries,
                    'current_month' => date('Y-m'),
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
     * Get RTO entries by client
     */
    public function getByClient($clientId)
    {
        try {
            $entries = RtoEntry::with([
                'ntTypeWork',
                'trTypeWork',
                'dlTypeWork',
                'vehicleClass',
            ])
                ->where('client_id', $clientId)
                ->latest()
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $entries,
                'message' => 'Client RTO entries retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve client RTO entries.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}