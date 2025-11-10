<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
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
            'room_id' => $this->room_id,
            'user_id' => $this->user_id,
            'content' => $this->content,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Include user data if loaded
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'user_id' => $this->user->user_id,
                    'is_admin' => $this->user->is_admin,
                    'is_mod' => $this->user->is_mod,
                    // Add any other user fields you want to expose
                ];
            }),

            'links' => [
                'self' => route('rooms.messages.show', [$this->room_id, $this->id]),
                'room' => route('rooms.show', $this->room_id)
            ]
        ];
    }
}
