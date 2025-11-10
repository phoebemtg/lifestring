<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'metadata' => $this->metadata,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Include participant count
            'participants_count' => $this->whenCounted('participants'),

            // Include messages count
            'messages_count' => $this->whenCounted('messages'),

            // Include the latest message if loaded
            'latest_message' => $this->when($this->relationLoaded('messages'), function () {
                $latestMessage = $this->messages->sortByDesc('created_at')->first();
                return $latestMessage ? new MessageResource($latestMessage) : null;
            }),

            // Include participants if loaded
            'participants' => UserResource::collection($this->whenLoaded('participants')),

            // Include messages if loaded
            'messages' => MessageResource::collection($this->whenLoaded('messages')),

            'links' => [
                'self' => route('rooms.show', $this->id)
            ]
        ];
    }
}
