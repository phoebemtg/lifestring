<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StringsResource extends JsonResource
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
            'content_text' => $this->content_text,
            'content_images' => $this->content_images,
            'stringable_type' => $this->stringable_type,
            'stringable_id' => $this->stringable_id,
            'likes_count' => $this->likes_count,
            'comments_count' => $this->comments_count,
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

            // Include comments if loaded
            'comments' => StringsCommentResource::collection($this->whenLoaded('comments')),

            // Include likes if loaded
            'likes' => $this->whenLoaded('likes', function () {
                return $this->likes->map(function ($like) {
                    return [
                        'user_id' => $like->user_id
                    ];
                });
            }),

            // Add a boolean indicating if the current user has liked this string
            'is_liked_by_user' => $this->when($request->user(), function () use ($request) {
                return $this->isLikedBy($request->user()->user_id);
            }),

            'links' => [
                'self' => route('strings.show', $this->id),
                'comments' => route('strings.comments.index', $this->id)
            ]
        ];
    }
}
