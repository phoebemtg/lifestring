<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\RoomResource;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Log;

class RoomController extends Controller
{

    /**
     * Display a listing of the rooms with optional filtering.
     */
    public function index(Request $request): ResourceCollection
    {

        $query = Room::query();

        // Only show rooms where the user is a participant
        $user = $request->user();
        $query->whereHas('participants', function ($query) use ($user) {
            $query->where('room_participants.user_id', $user->user_id);
        });


        // Include relationships
        if ($request->has('include')) {
            $includes = explode(',', $request->input('include'));
            $allowedIncludes = ['participants', 'messages', 'messages.user'];
            $validIncludes = array_intersect($allowedIncludes, $includes);

            if (!empty($validIncludes)) {
                $query->with($validIncludes);
            }

            // If including messages, limit to the most recent ones
            if (in_array('messages', $validIncludes)) {
                // Instead of loading all messages, we'll get the latest one for preview
                $query->with(['messages' => function ($query) {
                    $query->latest('created_at')->limit(1);
                }]);
            }
        }

        // Include counts
        if ($request->has('withCount')) {
            $counts = explode(',', $request->input('withCount'));
            $allowedCounts = ['participants', 'messages'];
            $validCounts = array_intersect($allowedCounts, $counts);

            if (!empty($validCounts)) {
                $query->withCount($validCounts);
            }
        }

        // Sorting
        $sortField = $request->input('sort_by', 'updated_at');
        $sortDirection = $request->input('sort_dir', 'desc');

        $allowedSortFields = ['created_at', 'updated_at', 'name'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        }

        $perPage = $request->input('per_page', 15);
        $rooms = $query->paginate($perPage);

        return RoomResource::collection($rooms);
    }

    /**
     * Store a newly created room.
     */
    public function store(Request $request): JsonResource
    {

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'metadata' => 'nullable|array',
            'participant_ids' => 'array|min:1', // At least one other participant
            'participant_ids.*' => 'uuid|exists:user_profiles,user_id'
        ]);

        // Create the room
        $room = Room::create([
            'name' => $validatedData['name'],
            'metadata' => $validatedData['metadata'] ?? null,
        ]);

        // Add the current user as a participant
        $currentUserId = $request->user()->user_id;
        $room->participants()->attach($currentUserId);

        // Add other participants
        if (!empty($validatedData['participant_ids'])) {
            // Filter out the current user's ID if it was included in the participant_ids
            $otherParticipantIds = array_filter($validatedData['participant_ids'], function ($id) use ($currentUserId) {
                return $id !== $currentUserId;
            });

            if (!empty($otherParticipantIds)) {
                $room->participants()->attach($otherParticipantIds);
            }
        }

        // Load the participants relationship for the response
        $room->load('participants');

        return new RoomResource($room);
    }

    /**
     * Display the specified room.
     */
    public function show(Room $room, Request $request): JsonResource
    {
        // Authorize the request - ensure the user is a participant
        if (!$room->hasParticipant($request->user()->user_id)) {
            return response()->json([
                'message' => 'You are not a member of this room.'
            ], 403);
        }

        // Include relationships if requested
        if ($request->has('include')) {
            $includes = explode(',', $request->input('include'));
            $allowedIncludes = ['participants', 'messages', 'messages.user'];
            $validIncludes = array_intersect($allowedIncludes, $includes);

            if (!empty($validIncludes)) {
                $room->load($validIncludes);
            }

            // If loading messages, apply pagination to them
            if (in_array('messages', $validIncludes)) {
                $messagesPerPage = $request->input('messages_per_page', 15);
                $messagesSortDir = $request->input('messages_sort_dir', 'desc');

                $messages = $room->messages()
                    ->with('user')
                    ->orderBy('created_at', $messagesSortDir)
                    ->paginate($messagesPerPage);

                // Replace the loaded messages with the paginated ones
                $room->setRelation('messages', $messages);
            }
        }

        return new RoomResource($room);
    }

    /**
     * Update the specified room.
     */
    public function update(Request $request, Room $room): JsonResource
    {
        // Ensure the user is a participant
        if (!$room->hasParticipant($request->user()->user_id)) {
            return response()->json([
                'message' => 'You are not a member of this room.'
            ], 403);
        }

        $validatedData = $request->validate([
            'name' => 'sometimes|string|max:255',
            'metadata' => 'sometimes|nullable|array',
        ]);

        $room->update($validatedData);

        return new RoomResource($room);
    }

    /**
     * Remove the specified room.
     *
     * Note: This will also delete all messages in the room due to the cascade delete in the database.
     */
    public function destroy(Request $request, Room $room): JsonResponse
    {
        // Ensure the user is a participant
        if (!$room->hasParticipant($request->user()->user_id)) {
            return response()->json([
                'message' => 'You are not a member of this room.'
            ], 403);
        }

        $room->delete();

        return response()->json(null, 204);
    }

    /**
     * Get all rooms that the authenticated user is a part of.
     */
    public function myRooms(Request $request): ResourceCollection
    {
        $user = $request->user();

        // Query rooms where the user is a participant
        $query = $user->rooms();

        // Include relationships
        if ($request->has('include')) {
            $includes = explode(',', $request->input('include'));
            $allowedIncludes = ['participants', 'messages', 'messages.user'];
            $validIncludes = array_intersect($allowedIncludes, $includes);

            if (!empty($validIncludes)) {
                $query->with($validIncludes);
            }

            // If including messages, limit to the most recent one
            if (in_array('messages', $validIncludes)) {
                $query->with(['messages' => function ($query) {
                    $query->latest('created_at')->limit(1);
                }]);
            }
        }

        // Include counts
        if ($request->has('withCount')) {
            $counts = explode(',', $request->input('withCount'));
            $allowedCounts = ['participants', 'messages'];
            $validCounts = array_intersect($allowedCounts, $counts);

            if (!empty($validCounts)) {
                $query->withCount($validCounts);
            }
        }

        // Sorting
        $sortField = $request->input('sort_by', 'updated_at');
        $sortDirection = $request->input('sort_dir', 'desc');

        $allowedSortFields = ['created_at', 'updated_at', 'name'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        }

        $perPage = $request->input('per_page', 15);
        $rooms = $query->paginate($perPage);

        return RoomResource::collection($rooms);
    }
}
