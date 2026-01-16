<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BmdsEntry;
use App\Models\Client;
use App\Models\DropdownOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BmdsEntryController extends Controller
{
     /**
     * Display a listing of the resource with comprehensive filters
     */
    public function index(Request $request)
    {
        try {
            $query = BmdsEntry::with([
                'client', 
                'client.city',
                'testPlace',
                'classOfVehicle',
                'admCarType',
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
                    ->orWhere('sr_num', 'like', "%{$search}%")
                    ->orWhere('reg_num', 'like', "%{$search}%")
                    ->orWhere('responsibility', 'like', "%{$search}%");
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

            // SR number filter
            if ($request->has('sr_num')) {
                $query->where('sr_num', 'like', "%{$request->sr_num}%");
            }

            // ========== BMDS TYPE & SUBTYPE FILTERS ==========
            // BMDS type filter
            if ($request->has('bmds_type')) {
                $query->where('bmds_type', $request->bmds_type);
            }

            // LLR subtype filter
            if ($request->has('llr_sub_type')) {
                $query->where('llr_sub_type', $request->llr_sub_type);
            }

            // DL subtype filter
            if ($request->has('dl_sub_type')) {
                $query->where('dl_sub_type', $request->dl_sub_type);
            }

            // Test place filter
            if ($request->has('test_place_id')) {
                $query->where('test_place_id', $request->test_place_id);
            }

            // Class of vehicle filter
            if ($request->has('class_of_vehicle_id')) {
                $query->where('class_of_vehicle_id', $request->class_of_vehicle_id);
            }

            // Number of classes filter
            if ($request->has('no_of_class')) {
                $query->where('no_of_class', $request->no_of_class);
            }

            // ADM car type filter
            if ($request->has('adm_car_type_id')) {
                $query->where('adm_car_type_id', $request->adm_car_type_id);
            }

            // KM ride filter
            if ($request->has('km_ride')) {
                $query->where('km_ride', $request->km_ride);
            }

            // ========== STATUS FILTER ==========
            // Form status filter
            if ($request->has('form_status')) {
                $query->where('form_status', $request->form_status);
            }

            // ========== DATE RANGE FILTERS ==========
            // Entry date range filter
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

            // Test date range filter
            if ($request->has('test_date_from') && $request->has('test_date_to')) {
                $query->whereBetween('test_date', [
                    $request->test_date_from,
                    $request->test_date_to
                ]);
            } elseif ($request->has('test_date_from')) {
                $query->where('test_date', '>=', $request->test_date_from);
            } elseif ($request->has('test_date_to')) {
                $query->where('test_date', '<=', $request->test_date_to);
            }

            // ADM start date range filter
            if ($request->has('start_dt_from') && $request->has('start_dt_to')) {
                $query->whereBetween('start_dt', [
                    $request->start_dt_from,
                    $request->start_dt_to
                ]);
            }

            // ADM end date range filter
            if ($request->has('end_dt_from') && $request->has('end_dt_to')) {
                $query->whereBetween('end_dt', [
                    $request->end_dt_from,
                    $request->end_dt_to
                ]);
            }

            // Month filter
            if ($request->has('month')) {
                $month = date('m', strtotime($request->month));
                $year = date('Y', strtotime($request->month));
                $query->whereYear('date', $year)->whereMonth('date', $month);
            }

            // ========== AMOUNT FILTERS ==========
            // Quotation amount range
            if ($request->has('quotation_from') && $request->has('quotation_to')) {
                $query->whereBetween('quotation_amt', [
                    $request->quotation_from,
                    $request->quotation_to
                ]);
            } elseif ($request->has('quotation_from')) {
                $query->where('quotation_amt', '>=', $request->quotation_from);
            } elseif ($request->has('quotation_to')) {
                $query->where('quotation_amt', '<=', $request->quotation_to);
            }

            // Advance amount range
            if ($request->has('advance_from') && $request->has('advance_to')) {
                $query->whereBetween('adv_amt', [
                    $request->advance_from,
                    $request->advance_to
                ]);
            }

            // Excess amount range
            if ($request->has('excess_from') && $request->has('excess_to')) {
                $query->whereBetween('excess_amt', [
                    $request->excess_from,
                    $request->excess_to
                ]);
            }

            // Recovery amount range
            if ($request->has('recovery_from') && $request->has('recovery_to')) {
                $query->whereBetween('recov_amt', [
                    $request->recovery_from,
                    $request->recovery_to
                ]);
            }

            // ========== SORTING ==========
            // Default sorting
            $sortBy = $request->has('sort_by') ? $request->sort_by : 'created_at';
            $sortOrder = $request->has('sort_order') ? $request->sort_order : 'desc';

            // Validate sort fields
            $validSortFields = [
                'reg_num', 'date', 'test_date', 'sr_num', 'quotation_amt', 'adv_amt',
                'created_at', 'updated_at', 'client_name', 'bmds_type'
            ];

            if (in_array($sortBy, $validSortFields)) {
                if ($sortBy === 'client_name') {
                    $query->leftJoin('client', 'bmds_entries.client_id', '=', 'client.id')
                          ->orderBy('client.client_name', $sortOrder)
                          ->select('bmds_entries.*');
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
                'message' => 'BMDS entries retrieved successfully.',
                'filters' => [
                    'applied' => $request->except(['page', 'per_page', 'sort_by', 'sort_order']),
                    'sort_by' => $sortBy,
                    'sort_order' => $sortOrder
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve BMDS entries: ' . $e->getMessage(), [
                'request' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve BMDS entries.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get filter options for BMDS entries
     */
    public function getFilterOptions(Request $request)
    {
        try {
            $options = [
                'bmds_types' => ['LLR', 'DL', 'ADM'],
                'llr_sub_types' => ['FRESH', 'EXEMPTED'],
                'dl_sub_types' => ['FRESH', 'ENDST', 'REVALID'],
                'no_of_classes' => ['1', '2', '3'],
                'km_rides' => ['5KM', '10KM'],
                'form_statuses' => ['PENDING', 'COMPLETE'],
                
                'test_places' => DropdownOption::where('category', 'test_places')->get(),
                'class_of_vehicles' => DropdownOption::where('category', 'class_of_vehicle')->get(),
                'adm_car_types' => DropdownOption::where('category', 'adm_car_types')->get(),

                // Get unique years and months for quick filters
                'unique_years' => BmdsEntry::select(DB::raw('YEAR(date) as year'))
                    ->distinct()
                    ->orderBy('year', 'desc')
                    ->pluck('year'),
                
                'unique_months' => $this->getUniqueMonths(),
            ];

            // Get stats for dashboard
            $stats = [
                'total' => BmdsEntry::count(),
                'llr' => BmdsEntry::llr()->count(),
                'dl' => BmdsEntry::dl()->count(),
                'adm' => BmdsEntry::adm()->count(),
                'pending' => BmdsEntry::pending()->count(),
                'complete' => BmdsEntry::complete()->count(),
                'deleted' => BmdsEntry::onlyTrashed()->count(),
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
        $entries = BmdsEntry::select('date')->get();
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
     * Get BMDS entries with comprehensive filtering
     */
    public function getFilteredEntries(Request $request)
    {
        try {
            $query = BmdsEntry::with([
                'client', 
                'client.city',
                'testPlace',
                'classOfVehicle',
                'admCarType',
            ]);

            // Apply filters
            $this->applyFilters($query, $request);

            // Sorting
            $sortBy = $request->has('sort_by') ? $request->sort_by : 'created_at';
            $sortOrder = $request->has('sort_order') ? $request->sort_order : 'desc';

            $validSortFields = ['reg_num', 'date', 'test_date', 'sr_num', 'created_at', 'updated_at', 'client_name', 'bmds_type'];
            if (in_array($sortBy, $validSortFields)) {
                if ($sortBy === 'client_name') {
                    $query->leftJoin('client', 'bmds_entries.client_id', '=', 'client.id')
                          ->orderBy('client.client_name', $sortOrder)
                          ->select('bmds_entries.*');
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
                'message' => 'BMDS entries retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve filtered BMDS entries: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve BMDS entries.',
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

        // Registration and SR number filters
        if ($request->has('reg_num')) {
            $query->where('reg_num', $request->reg_num);
        }

        if ($request->has('sr_num')) {
            $query->where('sr_num', 'like', "%{$request->sr_num}%");
        }

        // BMDS type and subtype filters
        if ($request->has('bmds_type')) {
            $query->where('bmds_type', $request->bmds_type);
        }

        if ($request->has('llr_sub_type')) {
            $query->where('llr_sub_type', $request->llr_sub_type);
        }

        if ($request->has('dl_sub_type')) {
            $query->where('dl_sub_type', $request->dl_sub_type);
        }

        // Test place filter
        if ($request->has('test_place_id')) {
            $query->where('test_place_id', $request->test_place_id);
        }

        // Class of vehicle filter
        if ($request->has('class_of_vehicle_id')) {
            $query->where('class_of_vehicle_id', $request->class_of_vehicle_id);
        }

        // Number of classes filter
        if ($request->has('no_of_class')) {
            $query->where('no_of_class', $request->no_of_class);
        }

        // ADM car type filter
        if ($request->has('adm_car_type_id')) {
            $query->where('adm_car_type_id', $request->adm_car_type_id);
        }

        // KM ride filter
        if ($request->has('km_ride')) {
            $query->where('km_ride', $request->km_ride);
        }

        // Status filter
        if ($request->has('form_status')) {
            $query->where('form_status', $request->form_status);
        }

        // Entry date range filter
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

        // Test date range filter
        if ($request->has('test_date_from') && $request->has('test_date_to')) {
            $query->whereBetween('test_date', [
                $request->test_date_from,
                $request->test_date_to
            ]);
        } elseif ($request->has('test_date_from')) {
            $query->where('test_date', '>=', $request->test_date_from);
        } elseif ($request->has('test_date_to')) {
            $query->where('test_date', '<=', $request->test_date_to);
        }

        // Amount filters
        if ($request->has('quotation_from') && $request->has('quotation_to')) {
            $query->whereBetween('quotation_amt', [
                $request->quotation_from,
                $request->quotation_to
            ]);
        }

        if ($request->has('advance_from') && $request->has('advance_to')) {
            $query->whereBetween('adv_amt', [
                $request->advance_from,
                $request->advance_to
            ]);
        }

        if ($request->has('excess_from') && $request->has('excess_to')) {
            $query->whereBetween('excess_amt', [
                $request->excess_from,
                $request->excess_to
            ]);
        }

        if ($request->has('recovery_from') && $request->has('recovery_to')) {
            $query->whereBetween('recov_amt', [
                $request->recovery_from,
                $request->recovery_to
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
            
            Log::info('BMDS Entry store method called', $request->all());

            // Base validation rules for all entries
            $baseRules = [
                'client_id' => 'required|exists:client,id',
                'date' => 'required|date',
                'time' => 'required|date_format:H:i',
                'bmds_type' => 'required|in:LLR,DL,ADM',
                'quotation_amt' => 'required|numeric|min:0',
                'adv_amt' => 'required|numeric|min:0',
                'excess_amt' => 'required|numeric|min:0',
                'recov_amt' => 'required|numeric|min:0',
                'responsibility' => 'nullable|string|max:255',
                'remark' => 'nullable|string',
                'form_status' => 'required|in:PENDING,COMPLETE',
            ];

            // Conditional rules based on bmds_type
            $conditionalRules = [];
            
            if ($request->bmds_type === 'LLR') {
                $conditionalRules = [
                    'llr_sub_type' => 'required|in:FRESH,EXEMPTED',
                    'test_place_id' => 'required|exists:dropdown_options,id',
                    'sr_num' => 'required|string|max:50',
                    'test_date' => 'required|date',
                    'class_of_vehicle_id' => 'required|exists:dropdown_options,id',
                    'no_of_class' => 'required|in:1,2,3',
                    
                    // DL and ADM fields should not be present for LLR
                    'dl_sub_type' => 'prohibited',
                    'start_time' => 'prohibited',
                    'end_time' => 'prohibited',
                    'start_dt' => 'prohibited',
                    'end_dt' => 'prohibited',
                    'adm_car_type_id' => 'prohibited',
                    'km_ride' => 'prohibited',
                ];
            } else if ($request->bmds_type === 'DL') {
                $conditionalRules = [
                    'dl_sub_type' => 'required|in:FRESH,ENDST,REVALID',
                    'test_place_id' => 'required|exists:dropdown_options,id',
                    'sr_num' => 'required|string|max:50',
                    'test_date' => 'required|date',
                    'class_of_vehicle_id' => 'required|exists:dropdown_options,id',
                    'no_of_class' => 'required|in:1,2,3',
                    
                    // LLR and ADM fields should not be present for DL
                    'llr_sub_type' => 'prohibited',
                    'start_time' => 'prohibited',
                    'end_time' => 'prohibited',
                    'start_dt' => 'prohibited',
                    'end_dt' => 'prohibited',
                    'adm_car_type_id' => 'prohibited',
                    'km_ride' => 'prohibited',
                ];
            } else if ($request->bmds_type === 'ADM') {
                $conditionalRules = [
                    'start_time' => 'required|date_format:H:i',
                    'end_time' => 'required|date_format:H:i',
                    'start_dt' => 'required|date',
                    'end_dt' => 'required|date',
                    'adm_car_type_id' => 'required|exists:dropdown_options,id',
                    'km_ride' => 'required|in:5KM,10KM',
                    
                    // LLR and DL fields should not be present for ADM
                    'llr_sub_type' => 'prohibited',
                    'dl_sub_type' => 'prohibited',
                    'test_place_id' => 'prohibited',
                    'sr_num' => 'prohibited',
                    'test_date' => 'prohibited',
                    'class_of_vehicle_id' => 'prohibited',
                    'no_of_class' => 'prohibited',
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

            // Pre-process data based on bmds_type BEFORE creating the model
            $processedData = $this->preprocessData($validatedData);

            Log::info('Creating BMDS entry with processed data:', $processedData);

            $bmdsEntry = BmdsEntry::create($processedData);

            Log::info('BMDS entry created successfully', ['bmds_entry_id' => $bmdsEntry->id]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $bmdsEntry->load([
                    'client', 
                    'client.city',
                    'testPlace',
                    'classOfVehicle',
                    'admCarType',
                ]),
                'message' => 'BMDS entry created successfully.'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('BMDS entry creation error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create BMDS entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Pre-process data based on bmds_type
     */
    private function preprocessData(array $data): array
    {
        if ($data['bmds_type'] === 'LLR') {
            // Ensure DL and ADM fields are not present
            unset($data['dl_sub_type']);
            unset($data['start_time']);
            unset($data['end_time']);
            unset($data['start_dt']);
            unset($data['end_dt']);
            unset($data['adm_car_type_id']);
            unset($data['km_ride']);
        } else if ($data['bmds_type'] === 'DL') {
            // Ensure LLR and ADM fields are not present
            unset($data['llr_sub_type']);
            unset($data['start_time']);
            unset($data['end_time']);
            unset($data['start_dt']);
            unset($data['end_dt']);
            unset($data['adm_car_type_id']);
            unset($data['km_ride']);
        } else if ($data['bmds_type'] === 'ADM') {
            // Ensure LLR and DL fields are not present
            unset($data['llr_sub_type']);
            unset($data['dl_sub_type']);
            unset($data['test_place_id']);
            unset($data['sr_num']);
            unset($data['test_date']);
            unset($data['class_of_vehicle_id']);
            unset($data['no_of_class']);
        }

        return $data;
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $entry = BmdsEntry::with([
                'client', 
                'client.city',
                'testPlace',
                'classOfVehicle',
                'admCarType',
            ])->find($id);

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'BMDS entry not found.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $entry,
                'message' => 'BMDS entry retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve BMDS entry.',
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

            $entry = BmdsEntry::find($id);

            if (!$entry) {
                Log::error('BMDS entry not found', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'BMDS entry not found.'
                ], 404);
            }

            Log::info('Found entry', ['entry' => $entry->toArray()]);

            // Base validation rules
            $baseRules = [
                'client_id' => 'sometimes|exists:client,id',
                'date' => 'sometimes|date',
                'time' => 'sometimes|date_format:H:i',
                'bmds_type' => 'sometimes|in:LLR,DL,ADM',
                'quotation_amt' => 'sometimes|numeric|min:0',
                'adv_amt' => 'sometimes|numeric|min:0',
                'excess_amt' => 'sometimes|numeric|min:0',
                'recov_amt' => 'sometimes|numeric|min:0',
                'responsibility' => 'nullable|string|max:255',
                'remark' => 'nullable|string',
                'form_status' => 'sometimes|in:PENDING,COMPLETE',
            ];

            // Determine current bmds_type for validation
            $bmdsType = $request->has('bmds_type') ? $request->bmds_type : $entry->bmds_type;

            // Conditional rules based on bmds_type
            $conditionalRules = [];
            
            if ($bmdsType === 'LLR') {
                $conditionalRules = [
                    'llr_sub_type' => 'required_with:bmds_type|in:FRESH,EXEMPTED',
                    'test_place_id' => 'required_with:bmds_type|exists:dropdown_options,id',
                    'sr_num' => 'required_with:bmds_type|string|max:50',
                    'test_date' => 'required_with:bmds_type|date',
                    'class_of_vehicle_id' => 'required_with:bmds_type|exists:dropdown_options,id',
                    'no_of_class' => 'required_with:bmds_type|in:1,2,3',
                    
                    // DL and ADM fields should not be present for LLR
                    'dl_sub_type' => 'prohibited',
                    'start_time' => 'prohibited',
                    'end_time' => 'prohibited',
                    'start_dt' => 'prohibited',
                    'end_dt' => 'prohibited',
                    'adm_car_type_id' => 'prohibited',
                    'km_ride' => 'prohibited',
                ];
            } else if ($bmdsType === 'DL') {
                $conditionalRules = [
                    'dl_sub_type' => 'required_with:bmds_type|in:FRESH,ENDST,REVALID',
                    'test_place_id' => 'required_with:bmds_type|exists:dropdown_options,id',
                    'sr_num' => 'required_with:bmds_type|string|max:50',
                    'test_date' => 'required_with:bmds_type|date',
                    'class_of_vehicle_id' => 'required_with:bmds_type|exists:dropdown_options,id',
                    'no_of_class' => 'required_with:bmds_type|in:1,2,3',
                    
                    // LLR and ADM fields should not be present for DL
                    'llr_sub_type' => 'prohibited',
                    'start_time' => 'prohibited',
                    'end_time' => 'prohibited',
                    'start_dt' => 'prohibited',
                    'end_dt' => 'prohibited',
                    'adm_car_type_id' => 'prohibited',
                    'km_ride' => 'prohibited',
                ];
            } else if ($bmdsType === 'ADM') {
                $conditionalRules = [
                    'start_time' => 'required_with:bmds_type|date_format:H:i',
                    'end_time' => 'required_with:bmds_type|date_format:H:i',
                    'start_dt' => 'required_with:bmds_type|date',
                    'end_dt' => 'required_with:bmds_type|date',
                    'adm_car_type_id' => 'required_with:bmds_type|exists:dropdown_options,id',
                    'km_ride' => 'required_with:bmds_type|in:5KM,10KM',
                    
                    // LLR and DL fields should not be present for ADM
                    'llr_sub_type' => 'prohibited',
                    'dl_sub_type' => 'prohibited',
                    'test_place_id' => 'prohibited',
                    'sr_num' => 'prohibited',
                    'test_date' => 'prohibited',
                    'class_of_vehicle_id' => 'prohibited',
                    'no_of_class' => 'prohibited',
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
                    'testPlace',
                    'classOfVehicle',
                    'admCarType',
                ]),
                'message' => 'BMDS entry updated successfully.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update BMDS entry.',
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
            $entry = BmdsEntry::find($id);

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'BMDS entry not found.'
                ], 404);
            }

            $entry->delete();

            return response()->json([
                'success' => true,
                'message' => 'BMDS entry deleted successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete BMDS entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore a soft deleted BMDS entry.
     */
    public function restore($id)
    {
        try {
            $entry = BmdsEntry::withTrashed()->find($id);

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'BMDS entry not found.'
                ], 404);
            }

            if (!$entry->trashed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'BMDS entry is not deleted.'
                ], 400);
            }

            $entry->restore();

            return response()->json([
                'success' => true,
                'data' => $entry->fresh()->load([
                    'client', 
                    'client.city',
                    'testPlace',
                    'classOfVehicle',
                    'admCarType',
                ]),
                'message' => 'BMDS entry restored successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore BMDS entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Permanently delete a BMDS entry.
     */
    public function forceDelete($id)
    {
        try {
            $entry = BmdsEntry::withTrashed()->find($id);

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'BMDS entry not found.'
                ], 404);
            }

            $entry->forceDelete();

            return response()->json([
                'success' => true,
                'message' => 'BMDS entry permanently deleted successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to permanently delete BMDS entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get BMDS entry by registration number
     */
    public function getByRegNum($regNum)
    {
        try {
            $entry = BmdsEntry::with([
                'client', 
                'client.city',
                'testPlace',
                'classOfVehicle',
                'admCarType',
            ])
                ->where('reg_num', $regNum)
                ->first();

            if (!$entry) {
                return response()->json([
                    'success' => false,
                    'message' => 'BMDS entry not found.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $entry,
                'message' => 'BMDS entry retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve BMDS entry.',
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
            $totalEntries = BmdsEntry::count();
            $llrEntries = BmdsEntry::llr()->count();
            $dlEntries = BmdsEntry::dl()->count();
            $admEntries = BmdsEntry::adm()->count();
            $pendingEntries = BmdsEntry::pending()->count();
            $completeEntries = BmdsEntry::complete()->count();
            $deletedEntries = BmdsEntry::onlyTrashed()->count();
            
            $currentMonth = date('n');
            $currentYear = date('Y');
            
            $nextRegNum = BmdsEntry::whereYear('date', $currentYear)
                ->whereMonth('date', $currentMonth)
                ->max('reg_num');
            $nextRegNum = $nextRegNum ? $nextRegNum + 1 : 1;

            return response()->json([
                'success' => true,
                'data' => [
                    'total_entries' => $totalEntries,
                    'llr_entries' => $llrEntries,
                    'dl_entries' => $dlEntries,
                    'adm_entries' => $admEntries,
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
     * Get BMDS entries by client
     */
    public function getByClient($clientId)
    {
        try {
            $entries = BmdsEntry::with([
                'testPlace',
                'classOfVehicle',
                'admCarType',
            ])
                ->where('client_id', $clientId)
                ->latest()
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $entries,
                'message' => 'Client BMDS entries retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve client BMDS entries.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}