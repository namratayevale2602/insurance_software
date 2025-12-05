<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DropdownOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class DropdownOptionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = DropdownOption::query();

            // Include trashed records if requested
            if ($request->has('with_trashed') && $request->with_trashed) {
                $query->withTrashed();
            }

            // Show only trashed records if requested
            if ($request->has('only_trashed') && $request->only_trashed) {
                $query->onlyTrashed();
            }

            // Category filter
            if ($request->has('category')) {
                $query->where('category', $request->category);
            }

            // Active filter
            if ($request->has('is_active')) {
                $query->where('is_active', $request->is_active);
            }

            // Search filter
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('category', 'like', "%{$search}%")
                      ->orWhere('value', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $options = $query->ordered()->get();

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
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'category' => 'required|string|max:50',
                'value' => 'required|string|max:255',
                'description' => 'nullable|string',
                'display_order' => 'nullable|integer|min:0',
                'is_active' => 'boolean',
                'metadata' => 'nullable|array',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $dropdownOption = DropdownOption::create($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $dropdownOption,
                'message' => 'Dropdown option created successfully.'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Dropdown option creation error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create dropdown option.',
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
            $dropdownOption = DropdownOption::find($id);

            if (!$dropdownOption) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dropdown option not found.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $dropdownOption,
                'message' => 'Dropdown option retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve dropdown option.',
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
            $dropdownOption = DropdownOption::find($id);

            if (!$dropdownOption) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dropdown option not found.'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'category' => 'sometimes|string|max:50',
                'value' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'display_order' => 'nullable|integer|min:0',
                'is_active' => 'boolean',
                'metadata' => 'nullable|array',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $dropdownOption->update($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $dropdownOption,
                'message' => 'Dropdown option updated successfully.'
            ]);

        } catch (\Exception $e) {
            Log::error('Dropdown option update error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update dropdown option.',
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
            $dropdownOption = DropdownOption::find($id);

            if (!$dropdownOption) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dropdown option not found.'
                ], 404);
            }

            $dropdownOption->delete();

            return response()->json([
                'success' => true,
                'message' => 'Dropdown option deleted successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete dropdown option.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore a soft deleted dropdown option.
     */
    public function restore($id)
    {
        try {
            $dropdownOption = DropdownOption::withTrashed()->find($id);

            if (!$dropdownOption) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dropdown option not found.'
                ], 404);
            }

            if (!$dropdownOption->trashed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dropdown option is not deleted.'
                ], 400);
            }

            $dropdownOption->restore();

            return response()->json([
                'success' => true,
                'data' => $dropdownOption,
                'message' => 'Dropdown option restored successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore dropdown option.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Permanently delete a dropdown option.
     */
    public function forceDelete($id)
    {
        try {
            $dropdownOption = DropdownOption::withTrashed()->find($id);

            if (!$dropdownOption) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dropdown option not found.'
                ], 404);
            }

            $dropdownOption->forceDelete();

            return response()->json([
                'success' => true,
                'message' => 'Dropdown option permanently deleted successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to permanently delete dropdown option.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dropdown options by category
     */
    public function getByCategory($category)
    {
        try {
            $options = DropdownOption::where('category', $category)
                ->active()
                ->ordered()
                ->get();

            return response()->json([
                'success' => true,
                'data' => $options,
                'message' => 'Dropdown options retrieved by category successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve dropdown options by category.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all categories
     */
    public function getCategories()
    {
        try {
            $categories = DropdownOption::distinct()
                ->pluck('category')
                ->map(function ($category) {
                    return [
                        'value' => $category,
                        'label' => ucwords(str_replace('_', ' ', $category))
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $categories,
                'message' => 'Categories retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve categories.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Activate dropdown option
     */
    public function activate($id)
    {
        try {
            $dropdownOption = DropdownOption::find($id);

            if (!$dropdownOption) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dropdown option not found.'
                ], 404);
            }

            $dropdownOption->activate();

            return response()->json([
                'success' => true,
                'data' => $dropdownOption,
                'message' => 'Dropdown option activated successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to activate dropdown option.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Deactivate dropdown option
     */
    public function deactivate($id)
    {
        try {
            $dropdownOption = DropdownOption::find($id);

            if (!$dropdownOption) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dropdown option not found.'
                ], 404);
            }

            $dropdownOption->deactivate();

            return response()->json([
                'success' => true,
                'data' => $dropdownOption,
                'message' => 'Dropdown option deactivated successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to deactivate dropdown option.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}