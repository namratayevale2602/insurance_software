<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Thought;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ThoughtController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Thought::query();

            // Search filter
            if ($request->has('search')) {
                $query->where('goodthought', 'like', "%{$request->search}%");
            }

            $thoughts = $query->latest()->get();

            return response()->json([
                'success' => true,
                'data' => $thoughts,
                'message' => 'Thoughts retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve thoughts.',
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
                'goodthought' => 'required|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $thought = Thought::create($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $thought,
                'message' => 'Thought created successfully.'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Thought creation error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create thought.',
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
            $thought = Thought::find($id);

            if (!$thought) {
                return response()->json([
                    'success' => false,
                    'message' => 'Thought not found.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $thought,
                'message' => 'Thought retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve thought.',
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
            $thought = Thought::find($id);

            if (!$thought) {
                return response()->json([
                    'success' => false,
                    'message' => 'Thought not found.'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'goodthought' => 'sometimes|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $thought->update($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $thought,
                'message' => 'Thought updated successfully.'
            ]);

        } catch (\Exception $e) {
            Log::error('Thought update error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update thought.',
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
            $thought = Thought::find($id);

            if (!$thought) {
                return response()->json([
                    'success' => false,
                    'message' => 'Thought not found.'
                ], 404);
            }

            $thought->delete();

            return response()->json([
                'success' => true,
                'message' => 'Thought deleted successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete thought.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get random thought
     */
    public function random()
    {
        try {
            $thought = Thought::inRandomOrder()->first();

            if (!$thought) {
                return response()->json([
                    'success' => false,
                    'message' => 'No thoughts found.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $thought,
                'message' => 'Random thought retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve random thought.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}