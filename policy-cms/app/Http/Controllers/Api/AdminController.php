<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    /**
     * Check if the authenticated user is an admin
     */
    private function checkAdmin()
    {
        if (!auth()->user() || !auth()->user()->isAdmin()) {
            return response()->json([
                'error' => 'Forbidden. Admin access required.'
            ], Response::HTTP_FORBIDDEN);
        }
        return null;
    }

    public function getUsers()
    {
        // Check admin access
        if ($error = $this->checkAdmin()) {
            return $error;
        }

        $users = User::select('id', 'name', 'email', 'role', 'created_at')
                    ->latest()
                    ->get();

        return response()->json([
            'users' => $users,
            'total' => $users->count()
        ]);
    }

    public function getStats()
    {
        // Check admin access
        if ($error = $this->checkAdmin()) {
            return $error;
        }

        $totalUsers = User::count();
        $adminUsers = User::where('role', 'admin')->count();
        $hodUsers = User::where('role', 'hod')->count();
        $ownerUsers = User::where('role', 'owner')->count();
        $gstOfficerUsers = User::where('role', 'gst_officer')->count();
        $regularUsers = User::where('role', 'user')->count();

        return response()->json([
            'stats' => [
                'total_users' => $totalUsers,
                'admin_users' => $adminUsers,
                'hod_users' => $hodUsers,
                'owner_users' => $ownerUsers,
                'gst_officer_users' => $gstOfficerUsers,
                'regular_users' => $regularUsers,
            ]
        ]);
    }

    public function createUser(Request $request)
    {
        // Check admin access
        if ($error = $this->checkAdmin()) {
            return $error;
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:user,hod,owner,gst_officer,admin',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), Response::HTTP_BAD_REQUEST);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user,
        ], Response::HTTP_CREATED);
    }

    public function updateUser(Request $request, $id)
    {
        // Check admin access
        if ($error = $this->checkAdmin()) {
            return $error;
        }

        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'sometimes|in:user,hod,owner,gst_officer,admin',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), Response::HTTP_BAD_REQUEST);
        }

        $user->update($request->only(['name', 'email', 'role']));

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user,
        ]);
    }

    public function deleteUser($id)
    {
        // Check admin access
        if ($error = $this->checkAdmin()) {
            return $error;
        }

        $user = User::findOrFail($id);
        
        // Prevent admin from deleting themselves
        if ($user->id === auth()->id()) {
            return response()->json([
                'error' => 'You cannot delete your own account.'
            ], Response::HTTP_BAD_REQUEST);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
}