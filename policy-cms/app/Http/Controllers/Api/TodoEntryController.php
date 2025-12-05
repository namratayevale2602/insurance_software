<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TodoEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class TodoEntryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = TodoEntry::with([
                'taskAssignTo',
                'taskAssignBy',
            ]);

            // Include trashed records if requested
            if ($request->has('with_trashed') && $request->with_trashed) {
                $query->withTrashed();
            }

            // Show only trashed records if requested
            if ($request->has('only_trashed') && $request->only_trashed) {
                $query->onlyTrashed();
            }

            // Date filter
            if ($request->has('date')) {
                $query->where('date', $request->date);
            }

            // Task type filter
            if ($request->has('task_type')) {
                $query->where('task_type', $request->task_type);
            }

            // Priority filter
            if ($request->has('priority')) {
                $query->where('priority', $request->priority);
            }

            // Assign to filter
            if ($request->has('task_assign_to_id')) {
                $query->where('task_assign_to_id', $request->task_assign_to_id);
            }

            // Assign by filter
            if ($request->has('task_assign_by_id')) {
                $query->where('task_assign_by_id', $request->task_assign_by_id);
            }

            // Status filter
            if ($request->has('status')) {
                if ($request->status === 'pending') {
                    $query->pending();
                } elseif ($request->status === 'overdue') {
                    $query->overdue();
                } elseif ($request->status === 'completed') {
                    $query->whereNotNull('reshedule_task')
                          ->where('reshedule_task', '<=', now()->toDateString());
                }
            }

            // Time period filters
            if ($request->has('period')) {
                if ($request->period === 'today') {
                    $query->today();
                } elseif ($request->period === 'this_week') {
                    $query->thisWeek();
                } elseif ($request->period === 'this_month') {
                    $query->thisMonth();
                }
            }

            // Search filter
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('task_to_complete', 'like', "%{$search}%")
                      ->orWhere('contact_to', 'like', "%{$search}%")
                      ->orWhere('report_to', 'like', "%{$search}%")
                      ->orWhere('contact', 'like', "%{$search}%")
                      ->orWhere('mobile_no', 'like', "%{$search}%");
                });
            }

            $todos = $query->latest()->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $todos,
                'message' => 'Todo entries retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve todo entries.',
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
            
            Log::info('Todo Entry store method called', $request->all());

            $validator = Validator::make($request->all(), [
                'date' => 'required|date',
                'time' => 'required|date_format:H:i',
                'task_assign_to_id' => 'required|exists:dropdown_options,id',
                'contact' => 'required|string|max:15',
                'task_assign_by_id' => 'required|exists:dropdown_options,id',
                'task_to_complete' => 'required|string|max:1000',
                'task_type' => 'required|in:DAILY,WEEKLY,MONTHLY,QUATERLY,YEARLY',
                'contact_to' => 'nullable|string|max:255',
                'mobile_no' => 'nullable|string|max:15',
                'priority' => 'required|in:HIGH,MEDIUM,LOW',
                'report_to' => 'nullable|string|max:255',
                'reshedule_task' => 'nullable|date|after_or_equal:date',
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

            $todoEntry = TodoEntry::create($validatedData);

            Log::info('Todo entry created successfully', ['todo_entry_id' => $todoEntry->id]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $todoEntry->load([
                    'taskAssignTo',
                    'taskAssignBy',
                ]),
                'message' => 'Todo entry created successfully.'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Todo entry creation error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create todo entry.',
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
            $todoEntry = TodoEntry::with([
                'taskAssignTo',
                'taskAssignBy',
            ])->find($id);

            if (!$todoEntry) {
                return response()->json([
                    'success' => false,
                    'message' => 'Todo entry not found.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $todoEntry,
                'message' => 'Todo entry retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve todo entry.',
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

            $todoEntry = TodoEntry::find($id);

            if (!$todoEntry) {
                Log::error('Todo entry not found', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Todo entry not found.'
                ], 404);
            }

            Log::info('Found todo entry', ['todo_entry' => $todoEntry->toArray()]);

            $validator = Validator::make($request->all(), [
                'date' => 'sometimes|date',
                'time' => 'sometimes|date_format:H:i',
                'task_assign_to_id' => 'sometimes|exists:dropdown_options,id',
                'contact' => 'sometimes|string|max:15',
                'task_assign_by_id' => 'sometimes|exists:dropdown_options,id',
                'task_to_complete' => 'sometimes|string|max:1000',
                'task_type' => 'sometimes|in:DAILY,WEEKLY,MONTHLY,QUATERLY,YEARLY',
                'contact_to' => 'nullable|string|max:255',
                'mobile_no' => 'nullable|string|max:15',
                'priority' => 'sometimes|in:HIGH,MEDIUM,LOW',
                'report_to' => 'nullable|string|max:255',
                'reshedule_task' => 'nullable|date|after_or_equal:date',
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

            Log::info('Data before update', $validatedData);
            
            $updated = $todoEntry->update($validatedData);
            
            Log::info('Update result', ['updated' => $updated, 'todo_entry_after' => $todoEntry->fresh()->toArray()]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $todoEntry->fresh()->load([
                    'taskAssignTo',
                    'taskAssignBy',
                ]),
                'message' => 'Todo entry updated successfully.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update todo entry.',
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
            $todoEntry = TodoEntry::find($id);

            if (!$todoEntry) {
                return response()->json([
                    'success' => false,
                    'message' => 'Todo entry not found.'
                ], 404);
            }

            $todoEntry->delete();

            return response()->json([
                'success' => true,
                'message' => 'Todo entry deleted successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete todo entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore a soft deleted todo entry.
     */
    public function restore($id)
    {
        try {
            $todoEntry = TodoEntry::withTrashed()->find($id);

            if (!$todoEntry) {
                return response()->json([
                    'success' => false,
                    'message' => 'Todo entry not found.'
                ], 404);
            }

            if (!$todoEntry->trashed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Todo entry is not deleted.'
                ], 400);
            }

            $todoEntry->restore();

            return response()->json([
                'success' => true,
                'data' => $todoEntry->fresh()->load([
                    'taskAssignTo',
                    'taskAssignBy',
                ]),
                'message' => 'Todo entry restored successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore todo entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Permanently delete a todo entry.
     */
    public function forceDelete($id)
    {
        try {
            $todoEntry = TodoEntry::withTrashed()->find($id);

            if (!$todoEntry) {
                return response()->json([
                    'success' => false,
                    'message' => 'Todo entry not found.'
                ], 404);
            }

            $todoEntry->forceDelete();

            return response()->json([
                'success' => true,
                'message' => 'Todo entry permanently deleted successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to permanently delete todo entry.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark todo as completed
     */
    public function markAsCompleted($id)
    {
        try {
            $todoEntry = TodoEntry::find($id);

            if (!$todoEntry) {
                return response()->json([
                    'success' => false,
                    'message' => 'Todo entry not found.'
                ], 404);
            }

            $todoEntry->markAsCompleted();

            return response()->json([
                'success' => true,
                'data' => $todoEntry->fresh()->load([
                    'taskAssignTo',
                    'taskAssignBy',
                ]),
                'message' => 'Todo entry marked as completed successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark todo entry as completed.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reschedule todo
     */
    public function reschedule(Request $request, $id)
    {
        try {
            $todoEntry = TodoEntry::find($id);

            if (!$todoEntry) {
                return response()->json([
                    'success' => false,
                    'message' => 'Todo entry not found.'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'reshedule_task' => 'required|date|after_or_equal:today',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $todoEntry->reschedule($request->reshedule_task);

            return response()->json([
                'success' => true,
                'data' => $todoEntry->fresh()->load([
                    'taskAssignTo',
                    'taskAssignBy',
                ]),
                'message' => 'Todo entry rescheduled successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reschedule todo entry.',
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
            $totalTodos = TodoEntry::count();
            $pendingTodos = TodoEntry::pending()->count();
            $overdueTodos = TodoEntry::overdue()->count();
            $completedTodos = TodoEntry::whereNotNull('reshedule_task')
                ->where('reshedule_task', '<=', now()->toDateString())
                ->count();
            $deletedTodos = TodoEntry::onlyTrashed()->count();
            
            $highPriorityTodos = TodoEntry::where('priority', 'HIGH')->count();
            $mediumPriorityTodos = TodoEntry::where('priority', 'MEDIUM')->count();
            $lowPriorityTodos = TodoEntry::where('priority', 'LOW')->count();

            $todayTodos = TodoEntry::today()->count();
            $thisWeekTodos = TodoEntry::thisWeek()->count();
            $thisMonthTodos = TodoEntry::thisMonth()->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_todos' => $totalTodos,
                    'pending_todos' => $pendingTodos,
                    'overdue_todos' => $overdueTodos,
                    'completed_todos' => $completedTodos,
                    'deleted_todos' => $deletedTodos,
                    'high_priority_todos' => $highPriorityTodos,
                    'medium_priority_todos' => $mediumPriorityTodos,
                    'low_priority_todos' => $lowPriorityTodos,
                    'today_todos' => $todayTodos,
                    'this_week_todos' => $thisWeekTodos,
                    'this_month_todos' => $thisMonthTodos,
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
     * Get todos by assignee
     */
    public function getByAssignee($assignToId)
    {
        try {
            $todos = TodoEntry::with([
                'taskAssignTo',
                'taskAssignBy',
            ])
                ->where('task_assign_to_id', $assignToId)
                ->latest()
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $todos,
                'message' => 'Todos retrieved by assignee successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve todos by assignee.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get todos by task type
     */
    public function getByTaskType($taskType)
    {
        try {
            $todos = TodoEntry::with([
                'taskAssignTo',
                'taskAssignBy',
            ])
                ->where('task_type', $taskType)
                ->latest()
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $todos,
                'message' => 'Todos retrieved by task type successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve todos by task type.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}