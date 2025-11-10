<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\UserResource;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Support\Facades\Log;

class RoomParticipantController extends Controller
{
    /**
     * List all participants in a room.
     */
    public function index(Room $room, Request $request): ResourceCollection
    {
        // Ensure the current user is a participant
        if (!$room->hasParticipant($request->user()->user_id)) {
            return response()->json([
                'message' => 'You are not a member of this room.'
            ], 403);
        }

        // Get participants
        $participants = $room->participants();

        // Sorting
        $sortField = $request->input('sort_by', 'user_id');
        $sortDirection = $request->input('sort_dir', 'asc');

        $allowedSortFields = ['user_id'];
        if (in_array($sortField, $allowedSortFields)) {
            $participants->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        }

        $perPage = $request->input('per_page', 15);
        $users = $participants->paginate($perPage);

        return UserResource::collection($users);
    }

    /**
     * Add a participant to a room.
     */
    public function store(Request $request, Room $room): JsonResponse
    {
        // Ensure the current user is a participant
        if (!$room->hasParticipant($request->user()->user_id)) {
            return response()->json([
                'message' => 'You are not a member of this room.'
            ], 403);
        }

        $validatedData = $request->validate([
            'user_id' => 'required|uuid|exists:user_profiles,user_id'
        ]);

        // Check if the user is already a participant
        if ($room->hasParticipant($validatedData['user_id'])) {
            return response()->json([
                'message' => 'User is already a participant in this room.',
                'errors' => [
                    'user_id' => ['User is already a participant.']
                ]
            ], 422);
        }

        // Add the user to the room
        $room->participants()->attach($validatedData['user_id']);

        return response()->json([
            'message' => 'User added to room successfully.'
        ], 201);
    }

    /**
     * Remove a participant from a room.
     */
    public function destroy(Request $request, Room $room, string $userId): JsonResponse
    {
        // Ensure the current user is a participant
        $currentUserId = $request->user()->user_id;
        if (!$room->hasParticipant($currentUserId)) {
            return response()->json([
                'message' => 'You are not a member of this room.'
            ], 403);
        }

        // Validate that the user exists
        $user = User::where('user_id', $userId)->first();
        if (!$user) {
            return response()->json([
                'message' => 'User not found.'
            ], 404);
        }

        // Check if the user is in the room
        if (!$room->hasParticipant($userId)) {
            return response()->json([
                'message' => 'User is not a member of this room.'
            ], 404);
        }

        // Only allow removing self or if you're an admin/mod
        if ($userId !== $currentUserId && !($request->user()->isAdmin() || $request->user()->isMod())) {
            return response()->json([
                'message' => 'You can only remove yourself unless you are an admin or moderator.'
            ], 403);
        }

        // Remove the user from the room
        $room->participants()->detach($userId);

        // Check if the room is now empty and delete it if it is
        if ($room->participants()->count() === 0) {
            $room->delete();
            return response()->json([
                'message' => 'User removed and empty room deleted.'
            ], 200);
        }

        return response()->json([
            'message' => 'User removed from room successfully.'
        ], 200);
    }
}
