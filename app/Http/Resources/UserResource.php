<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'is_admin' => $this->is_admin,
            'is_mod' => $this->is_mod,
            'contact_info' => $this->contact_info,
            'social_links' => $this->social_links,
            'attributes' => $this->attributes,
            'biography' => $this->biography,
            'meta' => $this->meta,
            'enneagrams' => EnneagramResource::collection($this->whenLoaded('enneagrams')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
