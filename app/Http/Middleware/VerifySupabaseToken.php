<?php

namespace App\Http\Middleware;

use Closure;
use Exception;
use Illuminate\Http\Request;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class VerifySupabaseToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get token from Authorization Header
        $token = $request->bearerToken();

        // If a token doesn't exist in the request
        if (!$token) {
            return response()->json(['message' => 'Authentication Token not provided'], 401);
        }

        // Token exists in the request
        try {

            // Grab the Secret
            $secret = config('services.supabase.jwt_secret');
            // Check to make sure that the supabase JWT Secret exists
            if (!$secret) { throw new \Exception('Supabase JWT Secret not found'); }
            // Decode and verify
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));

            $user = User::where('user_id', $decoded->sub)->first();

            // If a user with this Supabase ID doesn't exist in your local DB
            if (!$user) {
                return response()->json(['message' => 'User not found.'], 404);
            }

            // Set the user for the current request
            Auth::setUser($user);

        } catch (Exception $e) {
            // This will catch invalid signatures, expired tokens, etc.
            return response()->json(['message' => 'Invalid authentication token.', 'error' => $e->getMessage()], 401);
        }
        Log::info('Authentication successful for user ID: ' . $user->id);

        // If everything is valid then proceed
        return $next($request);
    }
}
