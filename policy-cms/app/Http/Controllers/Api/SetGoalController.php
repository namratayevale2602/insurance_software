<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SetGoal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class SetGoalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = SetGoal::query();

            // Service type filter
            if ($request->has('service_type')) {
                $query->where('service_type', $request->service_type);
            }

            // Search filter
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('service_type', 'like', "%{$search}%")
                      ->orWhere('goal', 'like', "%{$search}%");
                });
            }

            $goals = $query->latest()->get();

            return response()->json([
                'success' => true,
                'data' => $goals,
                'message' => 'Goals retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve goals.',
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
            $validator = Validator::make($request->all(), [
                'service_type' => 'required|string|max:255',
                'goal' => 'required|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $goal = SetGoal::create($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $goal,
                'message' => 'Goal created successfully.'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Goal creation error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create goal.',
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
            $goal = SetGoal::find($id);

            if (!$goal) {
                return response()->json([
                    'success' => false,
                    'message' => 'Goal not found.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $goal,
                'message' => 'Goal retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve goal.',
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
            $goal = SetGoal::find($id);

            if (!$goal) {
                return response()->json([
                    'success' => false,
                    'message' => 'Goal not found.'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'service_type' => 'sometimes|string|max:255',
                'goal' => 'sometimes|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $goal->update($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $goal,
                'message' => 'Goal updated successfully.'
            ]);

        } catch (\Exception $e) {
            Log::error('Goal update error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update goal.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $goal = SetGoal::find($id);

            if (!$goal) {
                return response()->json([
                    'success' => false,
                    'message' => 'Goal not found.'
                ], 404);
            }

            $goal->delete();

            return response()->json([
                'success' => true,
                'message' => 'Goal deleted successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete goal.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get goals by service type
     */
    public function getByServiceType($serviceType)
    {
        try {
            $goals = SetGoal::where('service_type', $serviceType)
                ->latest()
                ->get();

            return response()->json([
                'success' => true,
                'data' => $goals,
                'message' => 'Goals retrieved by service type successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve goals by service type.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}