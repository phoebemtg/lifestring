<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\MessageResource;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{

    /**
     * Get messages for a specific room.
     */
    public function index(Room $room, Request $request): ResourceCollection
    {
        // Ensure the user is a participant
        if (!$room->hasParticipant($request->user()->user_id)) {
            return response()->json([
                'message' => 'You are not a member of this room.'
            ], 403);
        }

        $query = $room->messages();

        // Include relationships
        if ($request->has('include')) {
            $includes = explode(',', $request->input('include'));
            $allowedIncludes = ['user'];
            $validIncludes = array_intersect($allowedIncludes, $includes);

            if (!empty($validIncludes)) {
                $query->with($validIncludes);
            }
        }

        // Sorting
        $sortField = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_dir', 'desc');

        $allowedSortFields = ['created_at'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        }

        // Support for "since" parameter to get messages after a certain date
        if ($request->has('since')) {
            $query->where('created_at', '>', $request->input('since'));
        }

        $perPage = $request->input('per_page', 15);
        $messages = $query->paginate($perPage);

        return MessageResource::collection($messages);
    }

    /**
     * Send a new message to a room.
     */
    public function store(Room $room, Request $request): JsonResource
    {
        // Ensure the user is a participant
        if (!$room->hasParticipant($request->user()->user_id)) {
            return response()->json([
                'message' => 'You are not a member of this room.'
            ], 403);
        }

        $validatedData = $request->validate([
            'content' => 'required|string|max:5000',
        ]);

        // Set user_id and room_id
        $validatedData['user_id'] = $request->user()->user_id;
        $validatedData['room_id'] = $room->id;

        $message = Message::create($validatedData);

        // Update the room's updated_at timestamp to help with sorting
        $room->touch();

        // Load relationships
        $message->load(['user']);

        return new MessageResource($message);
    }

    /**
     * Display the specified message.
     */
    public function show(Room $room, Message $message, Request $request): JsonResource
    {
        // Ensure the user is a participant
        if (!$room->hasParticipant($request->user()->user_id)) {
            return response()->json([
                'message' => 'You are not a member of this room.'
            ], 403);
        }

        // Check if the message belongs to the room
        if ($message->room_id !== $room->id) {
            return response()->json([
                'message' => 'Message not found in this room.'
            ], 404);
        }

        if ($request->has('include')) {
            $includes = explode(',', $request->input('include'));
            $allowedIncludes = ['user'];
            $validIncludes = array_intersect($allowedIncludes, $includes);

            if (!empty($validIncludes)) {
                $message->load($validIncludes);
            }
        }

        return new MessageResource($message);
    }

    /**
     * Update a message.
     */
    public function update(Request $request, Room $room, Message $message): JsonResource
    {
        // Ensure the user is a participant
        if (!$room->hasParticipant($request->user()->user_id)) {
            return response()->json([
                'message' => 'You are not a member of this room.'
            ], 403);
        }

        // Check if the message belongs to the room
        if ($message->room_id !== $room->id) {
            return response()->json([
                'message' => 'Message not found in this room.'
            ], 404);
        }

        // Only the message author can update it
        if ($message->user_id !== $request->user()->user_id) {
            return response()->json([
                'message' => 'You can only edit your own messages.'
            ], 403);
        }

        $validatedData = $request->validate([
            'content' => 'required|string|max:5000'
        ]);

        $message->update($validatedData);

        // Load the user relationship for the response
        $message->load('user');

        return new MessageResource($message);
    }

    /**
     * Delete a message.
     */
    public function destroy(Request $request, Room $room, Message $message): JsonResponse
    {
        // Ensure the user is a participant
        if (!$room->hasParticipant($request->user()->user_id)) {
            return response()->json([
                'message' => 'You are not a member of this room.'
            ], 403);
        }

        // Check if the message belongs to the room
        if ($message->room_id !== $room->id) {
            return response()->json([
                'message' => 'Message not found in this room.'
            ], 404);
        }

        // Only the message author, admins, or mods can delete it
        $user = $request->user();
        if ($message->user_id !== $user->user_id && !($user->isAdmin() || $user->isMod())) {
            return response()->json([
                'message' => 'You can only delete your own messages unless you are an admin or moderator.'
            ], 403);
        }

        $message->delete();

        return response()->json(null, 204);
    }
}
