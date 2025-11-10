<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EnneagramResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * This method defines the structure of the JSON response for an Enneagram model.
     * It ensures a consistent and controlled output for your API.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type_number' => $this->type_number,
            'name' => $this->name,
            'description' => $this->description,
            'attributes' => $this->attributes,

            // Include users relationship if it has been loaded
            'users' => UserResource::collection($this->whenLoaded('users')),
        ];
    }
}
