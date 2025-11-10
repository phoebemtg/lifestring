<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserRecommendationResource extends JsonResource
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
            'user_id' => $this->user_id,
            'recommended_user_id' => $this->recommended_user_id,
            'similarity_score' => $this->similarity_score,
            'status' => $this->status,
            'metadata' => $this->metadata,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            // Include recommended user data if it's loaded
            'recommended_user' => $this->whenLoaded('recommendedUser', function () {
                return new UserResource($this->recommendedUser);
            }),
        ];
    }
}
