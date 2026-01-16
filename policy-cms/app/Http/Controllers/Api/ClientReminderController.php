<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ClientReminderController extends Controller
{
    /**
     * Get upcoming birthdays and anniversaries
     */
    public function getUpcomingReminders(Request $request)
    {
        try {
            $daysAhead = $request->get('days_ahead', 30); // Default 30 days
            $today = now();
            $futureDate = now()->addDays($daysAhead);

            // Get upcoming birthdays
            $birthdayClients = Client::with(['city'])
                ->whereNotNull('birth_date')
                ->where(function($query) use ($today, $futureDate) {
                    // For current year
                    $query->whereRaw("DATE_FORMAT(CONCAT(YEAR(CURDATE()), '-', MONTH(birth_date), '-', DAY(birth_date)), '%Y-%m-%d') BETWEEN ? AND ?", 
                        [$today->format('Y-m-d'), $futureDate->format('Y-m-d')])
                    // For next year (in case we're near year end)
                    ->orWhereRaw("DATE_FORMAT(CONCAT(YEAR(CURDATE()) + 1, '-', MONTH(birth_date), '-', DAY(birth_date)), '%Y-%m-%d') BETWEEN ? AND ?", 
                        [$today->format('Y-m-d'), $futureDate->addYear()->format('Y-m-d')]);
                })
                ->orderByRaw("DAYOFYEAR(birth_date)")
                ->get()
                ->map(function($client) {
                    $nextBirthday = $this->getNextOccurrence($client->birth_date);
                    $daysUntil = $nextBirthday->diffInDays(now());
                    
                    return [
                        'id' => $client->id,
                        'client_name' => $client->client_name,
                        'contact' => $client->contact,
                        'birth_date' => $client->birth_date,
                        'age' => $client->age,
                        'next_occurrence' => $nextBirthday,
                        'days_until' => $daysUntil,
                        'city' => $client->city,
                        'type' => 'birthday'
                    ];
                });

            // Get upcoming anniversaries
            $anniversaryClients = Client::with(['city'])
                ->whereNotNull('anniversary_dt')
                ->where(function($query) use ($today, $futureDate) {
                    // For current year
                    $query->whereRaw("DATE_FORMAT(CONCAT(YEAR(CURDATE()), '-', MONTH(anniversary_dt), '-', DAY(anniversary_dt)), '%Y-%m-%d') BETWEEN ? AND ?", 
                        [$today->format('Y-m-d'), $futureDate->format('Y-m-d')])
                    // For next year
                    ->orWhereRaw("DATE_FORMAT(CONCAT(YEAR(CURDATE()) + 1, '-', MONTH(anniversary_dt), '-', DAY(anniversary_dt)), '%Y-%m-%d') BETWEEN ? AND ?", 
                        [$today->format('Y-m-d'), $futureDate->addYear()->format('Y-m-d')]);
                })
                ->orderByRaw("DAYOFYEAR(anniversary_dt)")
                ->get()
                ->map(function($client) {
                    $nextAnniversary = $this->getNextOccurrence($client->anniversary_dt);
                    $daysUntil = $nextAnniversary->diffInDays(now());
                    
                    return [
                        'id' => $client->id,
                        'client_name' => $client->client_name,
                        'contact' => $client->contact,
                        'anniversary_dt' => $client->anniversary_dt,
                        'next_occurrence' => $nextAnniversary,
                        'days_until' => $daysUntil,
                        'city' => $client->city,
                        'type' => 'anniversary'
                    ];
                });

            // Combine and sort by next occurrence
            $allReminders = $birthdayClients->merge($anniversaryClients)
                ->sortBy('days_until')
                ->values();

            // Group by date for report
            $groupedReminders = $allReminders->groupBy(function($item) {
                return $item['next_occurrence']->format('Y-m-d');
            })->map(function($items, $date) {
                return [
                    'date' => $date,
                    'formatted_date' => Carbon::parse($date)->format('d M Y'),
                    'items' => $items,
                    'birthday_count' => $items->where('type', 'birthday')->count(),
                    'anniversary_count' => $items->where('type', 'anniversary')->count(),
                ];
            })->sortBy('date');

            return response()->json([
                'success' => true,
                'data' => [
                    'reminders' => $allReminders,
                    'grouped_reminders' => $groupedReminders,
                    'total_birthdays' => $birthdayClients->count(),
                    'total_anniversaries' => $anniversaryClients->count(),
                    'total_reminders' => $allReminders->count(),
                    'days_ahead' => $daysAhead,
                    'from_date' => $today->format('Y-m-d'),
                    'to_date' => $futureDate->format('Y-m-d'),
                ],
                'message' => 'Upcoming reminders retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            Log::error('Get upcoming reminders error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve upcoming reminders.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get next occurrence of a date (handles year wrap-around)
     */
    private function getNextOccurrence($date)
    {
        $date = Carbon::parse($date);
        $today = Carbon::today();
        
        $nextOccurrence = Carbon::createFromDate(
            $today->year,
            $date->month,
            $date->day
        );
        
        // If the date has already passed this year, get next year's occurrence
        if ($nextOccurrence->lt($today)) {
            $nextOccurrence->addYear();
        }
        
        return $nextOccurrence;
    }

    /**
     * Get reminders by specific date range
     */
    public function getRemindersByDateRange(Request $request)
    {
        try {
            $validator = \Validator::make($request->all(), [
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'type' => 'nullable|in:birthday,anniversary,both',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $startDate = Carbon::parse($request->start_date);
            $endDate = Carbon::parse($request->end_date);
            $type = $request->get('type', 'both');

            $results = [];

            // Get birthday reminders
            if ($type === 'birthday' || $type === 'both') {
                $birthdayClients = Client::with(['city'])
                    ->whereNotNull('birth_date')
                    ->get()
                    ->filter(function($client) use ($startDate, $endDate) {
                        $nextBirthday = $this->getNextOccurrence($client->birth_date);
                        return $nextBirthday->between($startDate, $endDate);
                    })
                    ->map(function($client) {
                        $nextBirthday = $this->getNextOccurrence($client->birth_date);
                        
                        return [
                            'id' => $client->id,
                            'client_name' => $client->client_name,
                            'contact' => $client->contact,
                            'email' => $client->email,
                            'original_date' => $client->birth_date,
                            'next_date' => $nextBirthday,
                            'days_until' => $nextBirthday->diffInDays(now()),
                            'city' => $client->city,
                            'type' => 'birthday',
                            'age_at_next' => $nextBirthday->diffInYears(Carbon::parse($client->birth_date)) + 1,
                        ];
                    });

                $results['birthdays'] = $birthdayClients;
            }

            // Get anniversary reminders
            if ($type === 'anniversary' || $type === 'both') {
                $anniversaryClients = Client::with(['city'])
                    ->whereNotNull('anniversary_dt')
                    ->get()
                    ->filter(function($client) use ($startDate, $endDate) {
                        $nextAnniversary = $this->getNextOccurrence($client->anniversary_dt);
                        return $nextAnniversary->between($startDate, $endDate);
                    })
                    ->map(function($client) {
                        $nextAnniversary = $this->getNextOccurrence($client->anniversary_dt);
                        
                        return [
                            'id' => $client->id,
                            'client_name' => $client->client_name,
                            'contact' => $client->contact,
                            'email' => $client->email,
                            'original_date' => $client->anniversary_dt,
                            'next_date' => $nextAnniversary,
                            'days_until' => $nextAnniversary->diffInDays(now()),
                            'city' => $client->city,
                            'type' => 'anniversary',
                            'years_at_next' => $nextAnniversary->diffInYears(Carbon::parse($client->anniversary_dt)) + 1,
                        ];
                    });

                $results['anniversaries'] = $anniversaryClients;
            }

            // Combine results
            $allResults = collect();
            if (isset($results['birthdays'])) {
                $allResults = $allResults->merge($results['birthdays']);
            }
            if (isset($results['anniversaries'])) {
                $allResults = $allResults->merge($results['anniversaries']);
            }

            // Group by date
            $groupedResults = $allResults->groupBy(function($item) {
                return $item['next_date']->format('Y-m-d');
            })->map(function($items, $date) {
                return [
                    'date' => $date,
                    'formatted_date' => Carbon::parse($date)->format('d M Y'),
                    'items' => $items,
                    'birthday_count' => $items->where('type', 'birthday')->count(),
                    'anniversary_count' => $items->where('type', 'anniversary')->count(),
                ];
            })->sortBy('date');

            return response()->json([
                'success' => true,
                'data' => [
                    'reminders' => $allResults,
                    'grouped_reminders' => $groupedResults,
                    'birthday_count' => isset($results['birthdays']) ? $results['birthdays']->count() : 0,
                    'anniversary_count' => isset($results['anniversaries']) ? $results['anniversaries']->count() : 0,
                    'total_count' => $allResults->count(),
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d'),
                    'type' => $type,
                ],
                'message' => 'Reminders by date range retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            Log::error('Get reminders by date range error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve reminders.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get clients for sending messages (bulk selection)
     */
    public function getClientsForMessaging(Request $request)
    {
        try {
            $validator = \Validator::make($request->all(), [
                'date' => 'required|date',
                'type' => 'required|in:birthday,anniversary',
                'client_ids' => 'nullable|array',
                'client_ids.*' => 'exists:client,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $targetDate = Carbon::parse($request->date);
            $type = $request->type;
            $clientIds = $request->get('client_ids', []);

            $query = Client::with(['city']);

            if (!empty($clientIds)) {
                $query->whereIn('id', $clientIds);
            }

            if ($type === 'birthday') {
                $query->whereNotNull('birth_date')
                    ->whereRaw("MONTH(birth_date) = ? AND DAY(birth_date) = ?", 
                        [$targetDate->month, $targetDate->day]);
            } else {
                $query->whereNotNull('anniversary_dt')
                    ->whereRaw("MONTH(anniversary_dt) = ? AND DAY(anniversary_dt) = ?", 
                        [$targetDate->month, $targetDate->day]);
            }

            $clients = $query->get()->map(function($client) use ($type, $targetDate) {
                $data = [
                    'id' => $client->id,
                    'client_name' => $client->client_name,
                    'contact' => $client->contact,
                    'email' => $client->email,
                    'city' => $client->city,
                    'type' => $type,
                    'date' => $targetDate->format('Y-m-d'),
                    'selected' => true,
                ];

                if ($type === 'birthday') {
                    $data['age'] = $targetDate->diffInYears(Carbon::parse($client->birth_date));
                } else {
                    $data['years'] = $targetDate->diffInYears(Carbon::parse($client->anniversary_dt));
                }

                return $data;
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'clients' => $clients,
                    'count' => $clients->count(),
                    'date' => $targetDate->format('Y-m-d'),
                    'type' => $type,
                ],
                'message' => 'Clients for messaging retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            Log::error('Get clients for messaging error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve clients for messaging.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}