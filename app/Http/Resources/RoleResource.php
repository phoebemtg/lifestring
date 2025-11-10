<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * This method defines the structure of the JSON response for a Role model.
     * It ensures a consistent and controlled output for your API.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,

            // Include relationships if they have been loaded
            'permissions' => $this->whenLoaded('permissions', function() {
                return $this->permissions->map(function($permission) {
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name
                    ];
                });
            }),

            'users' => UserResource::collection($this->whenLoaded('users')),
        ];
    }
}
