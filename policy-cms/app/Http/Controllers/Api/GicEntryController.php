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
 /**
     * Display a listing of the resource with comprehensive filters
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

            // ========== SEARCH FILTERS ==========
            // General search across multiple fields
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->whereHas('client', function($clientQuery) use ($search) {
                        $clientQuery->where('client_name', 'like', "%{$search}%")
                            ->orWhere('contact', 'like', "%{$search}%");
                    })
                    ->orWhere('policy_num', 'like', "%{$search}%")
                    ->orWhere('reg_num', 'like', "%{$search}%")
                    ->orWhere('mv_num', 'like', "%{$search}%")
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

            // Policy number filter
            if ($request->has('policy_num')) {
                $query->where('policy_num', 'like', "%{$request->policy_num}%");
            }

            // ========== DROPDOWN FILTERS ==========
            // Form status filter
            if ($request->has('form_status')) {
                $query->where('form_status', $request->form_status);
            }

            // Policy type filter
            if ($request->has('policy_type')) {
                $query->where('policy_type', $request->policy_type);
            }

            // Policy duration filter
            if ($request->has('policy_duration')) {
                $query->where('policy_duration', $request->policy_duration);
            }

            // Insurance company filter
            if ($request->has('insurance_company_id')) {
                $query->where('insurance_company_id', $request->insurance_company_id);
            }

            // Vehicle type filter (for MOTOR policies)
            if ($request->has('vehicle_type_id')) {
                $query->where('vehicle_type_id', $request->vehicle_type_id);
            }

            // Motor subtype filter
            if ($request->has('motor_subtype')) {
                $query->where('motor_subtype', $request->motor_subtype);
            }

            // Non-motor policy subtype filter
            if ($request->has('nonmotor_policy_subtype_id')) {
                $query->where('nonmotor_policy_subtype_id', $request->nonmotor_policy_subtype_id);
            }

            // Adviser filter
            if ($request->has('adviser_name_id')) {
                $query->where('adviser_name_id', $request->adviser_name_id);
            }

            // Payment mode filter
            if ($request->has('pay_mode')) {
                $query->where('pay_mode', $request->pay_mode);
            }

            // ========== DATE RANGE FILTERS ==========
            // Date range filter (entry date)
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

            // Financial year filter
            if ($request->has('financial_year')) {
                $year = explode('-', $request->financial_year)[0];
                $query->byFinancialYear($year);
            }

            // ========== EXPIRY FILTERS ==========
            // Expiry report filter - get policies expiring soon
            if ($request->has('expiry_report') && $request->expiry_report == 'true') {
                $days = $request->has('expiry_days') ? $request->expiry_days : 30;
                $expiryDate = Carbon::now()->addDays($days);
                $query->where('end_dt', '<=', $expiryDate)
                      ->where('end_dt', '>=', Carbon::now());
            }

            // Expiry date range filter
            if ($request->has('expiry_date_from') && $request->has('expiry_date_to')) {
                $query->whereBetween('end_dt', [
                    $request->expiry_date_from,
                    $request->expiry_date_to
                ]);
            } elseif ($request->has('expiry_date_from')) {
                $query->where('end_dt', '>=', $request->expiry_date_from);
            } elseif ($request->has('expiry_date_to')) {
                $query->where('end_dt', '<=', $request->expiry_date_to);
            }

            // Expired policies filter
            if ($request->has('expired') && $request->expired == 'true') {
                $query->where('end_dt', '<', Carbon::now());
            }

            // Active policies filter (not expired)
            if ($request->has('active') && $request->active == 'true') {
                $query->where('end_dt', '>=', Carbon::now());
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

            // ========== SORTING ==========
            // Default sorting
            $sortBy = $request->has('sort_by') ? $request->sort_by : 'created_at';
            $sortOrder = $request->has('sort_order') ? $request->sort_order : 'desc';

            // Validate sort fields
            $validSortFields = [
                'reg_num', 'date', 'end_dt', 'premium_amt', 'adv_amt',
                'created_at', 'updated_at', 'client_name', 'policy_num'
            ];

            if (in_array($sortBy, $validSortFields)) {
                if ($sortBy === 'client_name') {
                    $query->leftJoin('client', 'gic_entries.client_id', '=', 'client.id')
                          ->orderBy('client.client_name', $sortOrder)
                          ->select('gic_entries.*');
                } else {
                    $query->orderBy($sortBy, $sortOrder);
                }
            } else {
                $query->latest();
            }

            // ========== PAGINATION ==========
            $perPage = $request->has('per_page') ? min($request->per_page, 100) : 10;
            $entries = $query->paginate($perPage);

            // Add additional expiry info if requested
            if ($request->has('expiry_report') && $request->expiry_report == 'true') {
                foreach ($entries as $entry) {
                    $entry->days_until_expiry = Carbon::parse($entry->end_dt)->diffInDays(Carbon::now());
                    $entry->is_expired = Carbon::parse($entry->end_dt)->isPast();
                    $entry->expiry_status = $this->getExpiryStatus($entry->end_dt);
                }
            }

            return response()->json([
                'success' => true,
                'data' => $entries,
                'message' => 'GIC entries retrieved successfully.',
                'filters' => [
                    'applied' => $request->except(['page', 'per_page', 'sort_by', 'sort_order']),
                    'sort_by' => $sortBy,
                    'sort_order' => $sortOrder
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve GIC entries: ' . $e->getMessage(), [
                'request' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve GIC entries.',
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

        // Policy filters
        if ($request->has('policy_type')) {
            $query->where('policy_type', $request->policy_type);
        }

        if ($request->has('policy_duration')) {
            $query->where('policy_duration', $request->policy_duration);
        }

        if ($request->has('form_status')) {
            $query->where('form_status', $request->form_status);
        }

        // Insurance company filter
        if ($request->has('insurance_company_id')) {
            $query->where('insurance_company_id', $request->insurance_company_id);
        }

        // Vehicle type filter
        if ($request->has('vehicle_type_id')) {
            $query->where('vehicle_type_id', $request->vehicle_type_id);
        }

        // Motor subtype filter
        if ($request->has('motor_subtype')) {
            $query->where('motor_subtype', $request->motor_subtype);
        }

        // Non-motor policy subtype filter
        if ($request->has('nonmotor_policy_subtype_id')) {
            $query->where('nonmotor_policy_subtype_id', $request->nonmotor_policy_subtype_id);
        }

        // Date range filter
        if ($request->has('date_from') && $request->has('date_to')) {
            $query->whereBetween('date', [
                $request->date_from,
                $request->date_to
            ]);
        }

        return $query;
    }

    /**
     * Get available filter options
     */
    public function getFilterOptions(Request $request)
    {
        try {
            $options = [
                'form_statuses' => ['PENDING', 'COMPLETE', 'CDA', 'CANCELLED', 'OTHER'],
                'policy_types' => ['MOTOR', 'NONMOTOR'],
                'policy_durations' => ['1YR', 'LONG', 'SHORT'],
                'motor_subtypes' => ['A', 'B', 'SAOD', 'ENDST'],
                'payment_modes' => ['CASH', 'CHEQUE', 'PAYMENT LINK', 'ONLINE', 'RTGS/NEFT'],
                
                'vehicle_types' => DropdownOption::getVehicleTypes(),
                'vehicles' => DropdownOption::getVehicles(),
                'nonmotor_policy_types' => DropdownOption::getNonmotorPolicyTypes(),
                'nonmotor_policy_subtypes' => DropdownOption::getNonmotorPolicySubtypes(),
                'advisers' => DropdownOption::getAdvisers(),
                'insurance_companies' => DropdownOption::getInsuranceCompanies(),
                'banks' => DropdownOption::getBanks(),
                'branches' => DropdownOption::getBranches(),

                // Get unique values for quick filters
                'unique_years' => GicEntry::select(DB::raw('YEAR(date) as year'))
                    ->distinct()
                    ->orderBy('year', 'desc')
                    ->pluck('year'),
                
                'financial_years' => $this->getFinancialYears(),
            ];

            // Get expiry status counts for dashboard
            $today = Carbon::now();
            $thirtyDays = Carbon::now()->addDays(30);
            
            $expiryStats = [
                'expired' => GicEntry::where('end_dt', '<', $today)->count(),
                'expiring_soon' => GicEntry::whereBetween('end_dt', [$today, $thirtyDays])->count(),
                'active' => GicEntry::where('end_dt', '>=', $thirtyDays)->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'filter_options' => $options,
                    'expiry_stats' => $expiryStats
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

    // Add this method to GicEntryController.php
/**
 * Get filter statistics
 */
public function getFilterStats(Request $request)
{
    try {
        $query = GicEntry::query();

        // Apply all filters from request
        $this->applyFilters($query, $request);

        // Count total entries with current filters
        $totalEntries = $query->count();

        // Get status distribution
        $statusDistribution = (clone $query)
            ->select('form_status', DB::raw('count(*) as count'))
            ->groupBy('form_status')
            ->get();

        // Get policy type distribution
        $policyTypeDistribution = (clone $query)
            ->select('policy_type', DB::raw('count(*) as count'), DB::raw('sum(premium_amt) as total_premium'))
            ->groupBy('policy_type')
            ->get();

        // Get insurance company distribution
        $companyDistribution = (clone $query)
            ->join('dropdown_options', 'gic_entries.insurance_company_id', '=', 'dropdown_options.id')
            ->select('dropdown_options.value as company_name', DB::raw('count(*) as count'), DB::raw('sum(premium_amt) as total_premium'))
            ->groupBy('insurance_company_id', 'dropdown_options.value')
            ->orderBy('count', 'desc')
            ->get();

        // Get policy duration distribution
        $durationDistribution = (clone $query)
            ->select('policy_duration', DB::raw('count(*) as count'), DB::raw('avg(premium_amt) as avg_premium'))
            ->groupBy('policy_duration')
            ->get();

        // Get vehicle type distribution (for motor policies)
        $vehicleTypeDistribution = (clone $query)
            ->join('dropdown_options', 'gic_entries.vehicle_type_id', '=', 'dropdown_options.id')
            ->where('policy_type', 'MOTOR')
            ->select('dropdown_options.value as vehicle_type', DB::raw('count(*) as count'))
            ->groupBy('vehicle_type_id', 'dropdown_options.value')
            ->get();

        // Calculate summary statistics
        $totalPremium = (clone $query)->sum('premium_amt');
        $avgPremium = $totalEntries > 0 ? $totalPremium / $totalEntries : 0;
        
        $completeCount = (clone $query)->where('form_status', 'COMPLETE')->count();
        $completionRate = $totalEntries > 0 ? ($completeCount / $totalEntries) * 100 : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => [
                    'total_entries' => $totalEntries,
                    'total_premium' => $totalPremium,
                    'avg_premium' => round($avgPremium, 2),
                    'completion_rate' => round($completionRate, 1),
                    'complete_count' => $completeCount,
                    'pending_count' => (clone $query)->where('form_status', 'PENDING')->count(),
                ],
                'by_status' => $statusDistribution,
                'by_policy_type' => $policyTypeDistribution,
                'by_company' => $companyDistribution,
                'by_duration' => $durationDistribution,
                'by_vehicle_type' => $vehicleTypeDistribution,
            ],
            'message' => 'Filter statistics retrieved successfully.'
        ]);

    } catch (\Exception $e) {
        Log::error('Failed to get filter statistics: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to retrieve filter statistics.',
            'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
        ], 500);
    }
}

/**
 * Get expiry report with annual projection for ALL policies
 * Shows each policy with its projected annual expiry dates
 */
public function expiryReport(Request $request)
{
    try {
        // Get base query without expiry filters
        $baseQuery = GicEntry::with([
            'client', 
            'vehicleType', 
            'vehicle', 
            'nonmotorPolicyType', 
            'nonmotorPolicySubtype',
            'adviser',
            'insuranceCompany',
            'bank',
        ]);

        // Apply all filters except expiry ones
        $this->applyFilters($baseQuery, $request);

        // Get all policies that match the filters
        $allPolicies = (clone $baseQuery)->get();
        
        $projectedEntries = collect();
        
        foreach ($allPolicies as $policy) {
            $startDate = Carbon::parse($policy->start_dt);
            $endDate = Carbon::parse($policy->end_dt);
            
            // Calculate total policy duration in years
            $totalYears = $startDate->diffInYears($endDate);
            
            // For 1YR policies, they only have 1 expiry date
            // For SHORT policies (less than 1 year), treat as 1 year
            // For LONG policies, create multiple projected dates
            
            if ($policy->policy_duration === '1YR' || $policy->policy_duration === 'SHORT') {
                // Single expiry date
                $projectedPolicy = clone $policy;
                $projectedPolicy->id = $policy->id . '_0';
                $projectedPolicy->end_dt = $endDate->toDateString();
                $projectedPolicy->projected_year = $endDate->year;
                $projectedPolicy->is_projection = false;
                $projectedPolicy->original_end_dt = $policy->end_dt;
                $projectedPolicy->projection_type = 'ACTUAL';
                $projectedPolicy->projection_number = 0;
                $projectedPolicy->total_projections = 1;
                
                $projectedEntries->push($projectedPolicy);
            } else {
                // LONG policies or any policy with multiple years
                // Create annual projections from start to end
                $projectionNumber = 0;
                
                for ($year = 0; $year <= $totalYears; $year++) {
                    $projectedEndDate = $startDate->copy()->addYears($year);
                    
                    // Only include if projected date is before or equal to actual end date
                    if ($projectedEndDate->lte($endDate)) {
                        $projectedPolicy = clone $policy;
                        $projectedPolicy->id = $policy->id . '_' . $year;
                        $projectedPolicy->end_dt = $projectedEndDate->toDateString();
                        $projectedPolicy->projected_year = $projectedEndDate->year;
                        $projectedPolicy->is_projection = $year > 0;
                        $projectedPolicy->original_end_dt = $policy->end_dt;
                        $projectedPolicy->projection_type = $year === 0 ? 'FIRST_YEAR' : 
                                                          ($year === $totalYears ? 'FINAL_YEAR' : 'INTERMEDIATE_YEAR');
                        $projectedPolicy->projection_number = $year;
                        $projectedPolicy->total_projections = $totalYears + 1;
                        
                        $projectedEntries->push($projectedPolicy);
                        $projectionNumber++;
                    }
                }
            }
        }
        
        // Now apply expiry filters to the projected entries
        if ($request->has('expiry_days')) {
            $expiryDate = Carbon::now()->addDays($request->expiry_days);
            $projectedEntries = $projectedEntries->filter(function($entry) use ($expiryDate) {
                $entryEndDate = Carbon::parse($entry->end_dt);
                // Check if expiry is within the specified days from now
                return $entryEndDate->between(Carbon::now(), $expiryDate);
            });
        }
        
        if ($request->has('expiry_date_from') && $request->has('expiry_date_to')) {
            $projectedEntries = $projectedEntries->filter(function($entry) use ($request) {
                $endDt = Carbon::parse($entry->end_dt);
                return $endDt->between(
                    Carbon::parse($request->expiry_date_from),
                    Carbon::parse($request->expiry_date_to)
                );
            });
        }
        
        // Filter expired/active if specified
        if ($request->has('expired') && $request->expired == 'true') {
            $projectedEntries = $projectedEntries->filter(function($entry) {
                return Carbon::parse($entry->end_dt)->isPast();
            });
        }
        
        if ($request->has('active') && $request->active == 'true') {
            $projectedEntries = $projectedEntries->filter(function($entry) {
                return Carbon::parse($entry->end_dt)->isFuture();
            });
        }
        
        // Default: show only upcoming expiries (next 365 days)
        if (!$request->has('expired') && !$request->has('expiry_date_from') && !$request->has('expiry_days')) {
            $defaultExpiryDate = Carbon::now()->addDays(365);
            $projectedEntries = $projectedEntries->filter(function($entry) use ($defaultExpiryDate) {
                $entryEndDate = Carbon::parse($entry->end_dt);
                return $entryEndDate->between(Carbon::now(), $defaultExpiryDate);
            });
        }
        
        // Sorting
        $sortBy = $request->has('sort_by') ? $request->sort_by : 'end_dt';
        $sortOrder = $request->has('sort_order') ? $request->sort_order : 'asc';
        
        // Custom sorting logic
        $sortedEntries = $projectedEntries->sortBy(function($entry) use ($sortBy, $sortOrder) {
            switch ($sortBy) {
                case 'end_dt':
                    return Carbon::parse($entry->end_dt)->timestamp;
                case 'days_until_expiry':
                    return Carbon::parse($entry->end_dt)->diffInDays(Carbon::now(), false);
                case 'client_name':
                    return $entry->client->client_name ?? '';
                case 'policy_num':
                    return $entry->policy_num;
                case 'reg_num':
                    return $entry->reg_num;
                default:
                    return Carbon::parse($entry->end_dt)->timestamp;
            }
        }, SORT_REGULAR, $sortOrder === 'desc');
        
        // Paginate manually
        $perPage = $request->has('per_page') ? min($request->per_page, 100) : 10;
        $currentPage = $request->has('page') ? $request->page : 1;
        
        $paginated = new \Illuminate\Pagination\LengthAwarePaginator(
            $sortedEntries->forPage($currentPage, $perPage),
            $sortedEntries->count(),
            $perPage,
            $currentPage,
            ['path' => $request->url(), 'query' => $request->query()]
        );
        
        $entries = $paginated;
        
        // Add expiry information and projection details
        foreach ($entries as $entry) {
            $entryEndDate = Carbon::parse($entry->end_dt);
            
            $entry->days_until_expiry = $entryEndDate->diffInDays(Carbon::now(), false);
            $entry->is_expired = $entryEndDate->isPast();
            $entry->expiry_status = $this->getExpiryStatus($entry->end_dt);
            $entry->expiry_date_formatted = $entryEndDate->format('d M Y');
            $entry->is_today = $entryEndDate->isToday();
            $entry->is_tomorrow = $entryEndDate->isTomorrow();
            
            // Add projection info for all policies
            $entry->has_multiple_projections = $entry->policy_duration === 'LONG';
            
            if ($entry->policy_duration === 'LONG') {
                $originalEnd = Carbon::parse($entry->original_end_dt);
                $entry->years_remaining = $entryEndDate->diffInYears($originalEnd);
                $entry->years_from_start = $entryEndDate->diffInYears(Carbon::parse($entry->start_dt));
                $entry->total_policy_years = Carbon::parse($entry->start_dt)->diffInYears($originalEnd);
                
                // Add helpful messages
                if ($entry->is_projection) {
                    $entry->projection_message = "Year " . ($entry->projection_number + 1) . " of " . $entry->total_projections;
                } else {
                    $entry->projection_message = "First year of " . $entry->total_projections . "-year policy";
                }
            }
        }
        
        // Calculate summary statistics
        $summary = [
            'total_entries' => $entries->total(),
            'total_policies' => $allPolicies->count(),
            'expired' => $entries->where('is_expired', true)->count(),
            'expiring_soon' => $entries->where('days_until_expiry', '>=', 0)
                                     ->where('days_until_expiry', '<=', 30)
                                     ->count(),
            'active' => $entries->where('days_until_expiry', '>', 30)->count(),
            'by_duration' => [
                '1YR' => $entries->where('policy_duration', '1YR')->count(),
                'LONG' => $entries->where('policy_duration', 'LONG')->count(),
                'SHORT' => $entries->where('policy_duration', 'SHORT')->count(),
            ],
            'by_projection_type' => [
                'actual' => $entries->where('is_projection', false)->count(),
                'projected' => $entries->where('is_projection', true)->count(),
            ],
            'nearest_expiry' => $entries->min('end_dt'),
            'farthest_expiry' => $entries->max('end_dt'),
            'next_7_days' => $entries->whereBetween('days_until_expiry', [0, 7])->count(),
            'next_30_days' => $entries->whereBetween('days_until_expiry', [0, 30])->count(),
            'next_90_days' => $entries->whereBetween('days_until_expiry', [0, 90])->count(),
        ];
        
        // Group by year for better overview
        $yearlySummary = [];
        foreach ($entries as $entry) {
            $year = Carbon::parse($entry->end_dt)->year;
            if (!isset($yearlySummary[$year])) {
                $yearlySummary[$year] = 0;
            }
            $yearlySummary[$year]++;
        }
        $summary['by_year'] = $yearlySummary;

        return response()->json([
            'success' => true,
            'data' => $entries,
            'summary' => $summary,
            'projection_info' => [
                'description' => 'All policies are shown with their annual expiry projections. LONG policies appear multiple times - once for each year of their duration.',
                'policy_types' => [
                    '1YR' => 'Shows actual expiry date only',
                    'SHORT' => 'Shows actual expiry date only',
                    'LONG' => 'Shows annual projected expiry dates from start to end',
                ]
            ],
            'message' => 'Expiry report with annual projections generated successfully.'
        ]);

    } catch (\Exception $e) {
        Log::error('Failed to generate expiry report: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to generate expiry report.',
            'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
        ], 500);
    }
}

    /**
     * Get financial years from data
     */
    private function getFinancialYears()
    {
        $entries = GicEntry::select('date')->get();
        $financialYears = [];
        
        foreach ($entries as $entry) {
            $year = $entry->date->year;
            $month = $entry->date->month;
            
            if ($month >= 4) {
                $fy = $year . '-' . ($year + 1);
            } else {
                $fy = ($year - 1) . '-' . $year;
            }
            
            if (!in_array($fy, $financialYears)) {
                $financialYears[] = $fy;
            }
        }
        
        rsort($financialYears);
        return $financialYears;
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