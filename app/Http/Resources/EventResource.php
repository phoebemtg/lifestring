<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * This method defines the structure of the JSON response for an Event model.
     * It ensures a consistent and controlled output for your API.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'title' => $this->title,
            'description' => $this->description,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'location' => $this->location,
            'meta_data' => $this->meta_data,
            'custom_fields' => $this->custom_fields,
            'created_at' => $this->created_at,

            // Include user relationship if it has been loaded
            'user' => $this->when($this->relationLoaded('user'), function () {
                return new UserResource($this->user);
            }),

            // Include any additional generated links or metadata
            'links' => [
                'self' => route('events.show', $this->id),
            ],
        ];
    }
}
