<?php

namespace App\Http\Controllers;

use App\Models\UserConnection;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\UserConnectionResource;
use App\Http\Resources\UserConnectionCollection;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class UserConnectionController extends Controller
{
    /**
     * Display a listing of user connections.
     */
    public function index(Request $request): ResourceCollection
    {
        $userId = $request->user()->user_id;

        $query = UserConnection::query();

        // Filter by connection type
        $type = $request->input('type', 'all');

        if ($type === 'sent') {
            $query->where('requester_id', $userId);
        } elseif ($type === 'received') {
            $query->where('receiver_id', $userId);
        } else {
            // 'all' - both sent and received connections
            $query->where(function ($query) use ($userId) {
                $query->where('requester_id', $userId)
                      ->orWhere('receiver_id', $userId);
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Include relationships
        if ($request->has('include')) {
            $includes = explode(',', $request->input('include'));
            $allowedIncludes = ['requester', 'receiver'];
            $validIncludes = array_intersect($allowedIncludes, $includes);

            if (!empty($validIncludes)) {
                $query->with($validIncludes);
            }
        }

        // Sorting
        $sortField = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_dir', 'desc');

        $allowedSortFields = ['created_at', 'updated_at', 'status'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        }

        $perPage = $request->input('per_page', 15);
        $connections = $query->paginate($perPage);

        return UserConnectionResource::collection($connections);
    }

    /**
     * Store a newly created connection request.
     */
    public function store(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'receiver_id' => 'required|uuid|exists:user_profiles,user_id',
        ]);

        $requesterId = $request->user()->user_id;
        $receiverId = $validatedData['receiver_id'];

        // Check if trying to connect to self
        if ($requesterId === $receiverId) {
            return response()->json([
                'message' => 'Cannot create a connection with yourself',
                'errors' => [
                    'receiver_id' => ['You cannot connect with yourself']
                ]
            ], 422);
        }

        // Check if connection already exists in either direction
        $existingConnection = UserConnection::where(function ($query) use ($requesterId, $receiverId) {
            $query->where('requester_id', $requesterId)
                  ->where('receiver_id', $receiverId);
        })->orWhere(function ($query) use ($requesterId, $receiverId) {
            $query->where('requester_id', $receiverId)
                  ->where('receiver_id', $requesterId);
        })->first();

        if ($existingConnection) {
            return response()->json([
                'message' => 'A connection already exists between these users',
                'connection' => new UserConnectionResource($existingConnection)
            ], 422);
        }

        // Create connection
        $connection = UserConnection::create([
            'requester_id' => $requesterId,
            'receiver_id' => $receiverId,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Connection request sent successfully',
            'connection' => new UserConnectionResource($connection)
        ], 201);
    }

    /**
     * Display the specified connection.
     */
    public function show(Request $request, string $userId): JsonResponse
    {
        $currentUserId = $request->user()->user_id;

        // Find connection in either direction between the two users
        $connection = UserConnection::where(function ($query) use ($currentUserId, $userId) {
            $query->where('requester_id', $currentUserId)
                  ->where('receiver_id', $userId);
        })->orWhere(function ($query) use ($currentUserId, $userId) {
            $query->where('requester_id', $userId)
                  ->where('receiver_id', $currentUserId);
        })->first();

        if (!$connection) {
            return response()->json([
                'message' => 'Connection not found'
            ], 404);
        }

        // Load relationships if requested
        if ($request->has('include')) {
            $includes = explode(',', $request->input('include'));
            $allowedIncludes = ['requester', 'receiver'];
            $validIncludes = array_intersect($allowedIncludes, $includes);

            if (!empty($validIncludes)) {
                $connection->load($validIncludes);
            }
        }

        return response()->json([
            'connection' => new UserConnectionResource($connection)
        ]);
    }

    /**
     * Update the specified connection status.
     *
     * This method allows users to respond to a connection request.
     * The user ID in the URL must be the requester's ID, and the authenticated
     * user must be the receiver of the connection request.
     *
     * @param Request $request The HTTP request
     * @param string $userId The ID of the user who sent the connection request
     * @return JsonResponse
     */
    public function update(Request $request, string $userId): JsonResponse
    {
        $validatedData = $request->validate([
            'status' => 'required|in:accepted,dismissed',
        ]);

        $currentUserId = $request->user()->user_id;

        // Find connection where current user is the receiver
        $connection = UserConnection::where('requester_id', $userId)
                                   ->where('receiver_id', $currentUserId)
                                   ->first();

        if (!$connection) {
            return response()->json([
                'message' => 'Connection request not found'
            ], 404);
        }

        // Only allow updating status of pending requests
        if ($connection->status !== 'pending') {
            return response()->json([
                'message' => 'Connection has already been ' . $connection->status
            ], 422);
        }

        // Update connection status
        $connection->status = $validatedData['status'];
        $connection->save();

        return response()->json([
            'message' => 'Connection ' . $validatedData['status'] . ' successfully',
            'connection' => new UserConnectionResource($connection)
        ]);
    }

    /**
     * Remove the specified connection.
     */
    public function destroy(Request $request, string $userId): JsonResponse
    {
        $currentUserId = $request->user()->user_id;

        // Find connection in either direction between the two users
        $connection = UserConnection::where(function ($query) use ($currentUserId, $userId) {
            $query->where('requester_id', $currentUserId)
                  ->where('receiver_id', $userId);
        })->orWhere(function ($query) use ($currentUserId, $userId) {
            $query->where('requester_id', $userId)
                  ->where('receiver_id', $currentUserId);
        })->first();

        if (!$connection) {
            return response()->json([
                'message' => 'Connection not found'
            ], 404);
        }

        // Delete connection
        $connection->delete();

        return response()->json(null, 204);
    }

    /**
     * Get connections for the authenticated user.
     */
    public function myConnections(Request $request): ResourceCollection
    {
        $userId = $request->user()->user_id;

        $query = UserConnection::where(function ($query) use ($userId) {
            $query->where('requester_id', $userId)
                  ->orWhere('receiver_id', $userId);
        });

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Always include the other user
        if ($request->has('include')) {
            $includes = explode(',', $request->input('include'));
            $allowedIncludes = ['requester', 'receiver'];
            $validIncludes = array_intersect($allowedIncludes, $includes);

            if (!empty($validIncludes)) {
                $query->with($validIncludes);
            }
        } else {
            $query->with(['requester', 'receiver']);
        }

        $perPage = $request->input('per_page', 15);
        $connections = $query->paginate($perPage);

        return UserConnectionResource::collection($connections);
    }

    /**
     * Get pending connection requests for the authenticated user.
     */
    public function pendingRequests(Request $request): ResourceCollection
    {
        $userId = $request->user()->user_id;

        $query = UserConnection::where('receiver_id', $userId)
                              ->where('status', 'pending');

        // Include sender information
        $query->with('requester');

        $perPage = $request->input('per_page', 15);
        $connections = $query->paginate($perPage);

        return UserConnectionResource::collection($connections);
    }
}
