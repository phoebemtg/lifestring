<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserConnectionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'requester_id' => $this->requester_id,
            'receiver_id' => $this->receiver_id,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Include user data if loaded
            'requester' => new UserResource($this->whenLoaded('requester')),
            'receiver' => new UserResource($this->whenLoaded('receiver')),
        ];
    }
}
