<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors()
            ], Response::HTTP_BAD_REQUEST);
        }

        
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'error' => 'Unauthorized. Check your credentials.'
            ], Response::HTTP_UNAUTHORIZED);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        
        // Revoke existing tokens
        $user->tokens()->delete();
        
        // Create access token (1 hour)
        $accessToken = $user->createToken('access_token', ['*'], now()->addMinutes(1))->plainTextToken;
        
        // Create refresh token (7 days)
        $refreshToken = $user->createToken('refresh_token', ['refresh'], now()->addDays(7))->plainTextToken;

        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ];

         $response = response()->json([
        'message' => 'User successfully logged in',
        'user' => $userData,
    ]);

    // FIXED: Cross-origin cookie configuration
    $cookieConfig = [
        'path' => '/',
        'domain' => 'localhost', // Explicitly set to localhost
        'secure' => false, // false for HTTP in development
        'httpOnly' => true, // false to allow JS access (for debugging)
        'raw' => false,
        'sameSite' => 'lax' // or 'none' if issues persist
    ];


    // Set access token cookie
    $accessCookie = cookie(
        'access_token',
        $accessToken,
        1,
        $cookieConfig['path'],
        $cookieConfig['domain'],
        $cookieConfig['secure'],
        $cookieConfig['httpOnly'],
        $cookieConfig['raw'],
        $cookieConfig['sameSite']
    );

    // Set refresh token cookie  
    $refreshCookie = cookie(
        'refresh_token',
        $refreshToken,
        10080,
        $cookieConfig['path'],
        $cookieConfig['domain'],
        $cookieConfig['secure'],
        $cookieConfig['httpOnly'],
        $cookieConfig['raw'],
        $cookieConfig['sameSite']
    );

    return $response->withCookie($accessCookie)->withCookie($refreshCookie);
}

    public function logout(Request $request): JsonResponse
    {
        try {
            
            if ($request->user()) {
                $request->user()->tokens()->delete();
            }

            $response = response()->json([
                'message' => 'User successfully logged out'
            ]);

            // Clear cookies properly
            return $response
                ->withoutCookie('access_token')
                ->withoutCookie('refresh_token');

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Logout failed',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function user(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'error' => 'User not authenticated'
                ], Response::HTTP_UNAUTHORIZED);
            }


            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch user data',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function checkAuth(Request $request): JsonResponse
{
    try {
        $user = null;
        $accessToken = $request->cookie('access_token');
        $refreshToken = $request->cookie('refresh_token');
        
        \Log::debug('checkAuth cookies', [
            'has_access_token' => !empty($accessToken),
            'has_refresh_token' => !empty($refreshToken),
        ]);

        // First try to authenticate with access token
        if ($accessToken) {
            $token = PersonalAccessToken::findToken($accessToken);
            
            if ($token) {
                // Check if token is expired
                if ($token->expires_at && $token->expires_at->isPast()) {
                    \Log::debug('Access token expired, attempting refresh');
                    // Token expired, try to refresh
                    $user = $this->attemptTokenRefresh($request);
                } else {
                    \Log::debug('Access token valid');
                    $user = $token->tokenable;
                }
            }
        }
        
        // If no user yet and we have refresh token, try refresh
        if (!$user && $refreshToken) {
            \Log::debug('Trying refresh token');
            $user = $this->attemptTokenRefresh($request);
        }

        if ($user) {
            Auth::setUser($user);
            
            // Check if we generated a new token during refresh
            if (isset($user->newAccessToken)) {
                \Log::debug('New access token generated during checkAuth');
                
                $response = response()->json([
                    'authenticated' => true,
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                    ],
                    'token_refreshed' => true // Add flag for debugging
                ]);
                
                // Set the new access token cookie
                return $response->cookie(
                    'access_token',
                    $user->newAccessToken,
                    2,
                    '/',
                    'localhost',
                    false,
                    false, // Allow JS access
                    false,
                    'lax'
                );
            }
            
            return response()->json([
                'authenticated' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ]
            ]);
        }

        return response()->json([
            'authenticated' => false,
            'message' => 'No valid authentication found'
        ]);

    } catch (\Exception $e) {
        \Log::error('checkAuth error: ' . $e->getMessage());
        return response()->json([
            'authenticated' => false,
            'error' => $e->getMessage()
        ]);
    }
}

private function attemptTokenRefresh(Request $request)
{
    try {
        $refreshToken = $request->cookie('refresh_token');
        
        if (!$refreshToken) {
            \Log::debug('No refresh token found');
            return null;
        }

        $token = PersonalAccessToken::findToken($refreshToken);
        
        if (!$token) {
            \Log::debug('Refresh token not found in database');
            return null;
        }

        // Verify this is a refresh token
        if (!$token->can('refresh')) {
            \Log::debug('Token does not have refresh ability');
            return null;
        }

        $user = $token->tokenable;

        // Check if refresh token is expired
        if ($token->expires_at && $token->expires_at->isPast()) {
            \Log::debug('Refresh token expired');
            $token->delete();
            return null;
        }

        // Revoke old access tokens
        $user->tokens()->where('name', 'access_token')->delete();
        
        \Log::debug('Creating new access token');

        // Create new access token (2 minutes)
        $newAccessToken = $user->createToken('access_token', ['*'], now()->addMinutes(2))->plainTextToken;

        // Store the new token on the user object temporarily
        $user->newAccessToken = $newAccessToken;
        
        \Log::debug('New access token created');

        return $user;

    } catch (\Exception $e) {
        \Log::error('Token refresh failed: ' . $e->getMessage());
        return null;
    }
}

    public function refresh(Request $request): JsonResponse
{
    try {
        $refreshToken = $request->cookie('refresh_token');
        
        if (!$refreshToken) {
            return response()->json([
                'error' => 'No refresh token found'
            ], Response::HTTP_UNAUTHORIZED);
        }

        $token = PersonalAccessToken::findToken($refreshToken);
        
        if (!$token) {
            return response()->json([
                'error' => 'Invalid refresh token'
            ], Response::HTTP_UNAUTHORIZED);
        }

        if (!$token->can('refresh')) {
            return response()->json([
                'error' => 'Token cannot be used for refresh'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Check if refresh token is expired
        if ($token->expires_at && $token->expires_at->isPast()) {
            $token->delete();
            return response()->json([
                'error' => 'Refresh token expired'
            ], Response::HTTP_UNAUTHORIZED);
        }

        $user = $token->tokenable;

        // Revoke old access tokens
        $user->tokens()->where('name', 'access_token')->delete();

        // Create new access token
        $newAccessToken = $user->createToken('access_token', ['*'], now()->addMinutes(1))->plainTextToken;

        $response = response()->json([
            'message' => 'Token refreshed successfully'
        ]);

        // Set the new access token cookie
        return $response->cookie(
            'access_token',
            $newAccessToken,
            1,
            '/',
            'localhost',
            false,
            false,
            false,
            'lax'
        );

    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Token refresh failed',
            'message' => $e->getMessage()
        ], Response::HTTP_INTERNAL_SERVER_ERROR);
    }
}

    /**
     * Get CSRF token for frontend
     */
    public function getCsrfToken(Request $request): JsonResponse
    {
        return response()->json([
            'csrf_token' => csrf_token(),
            'message' => 'CSRF token generated successfully'
        ]);
    }
}