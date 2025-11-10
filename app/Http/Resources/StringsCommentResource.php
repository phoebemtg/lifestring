<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StringsCommentResource extends JsonResource
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
            'string_id' => $this->string_id,
            'user_id' => $this->user_id,
            'parent_comment_id' => $this->parent_comment_id,
            'content' => $this->content,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'is_reply' => $this->isReply(),

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

            // Include parent comment if loaded
            'parent_comment' => new StringsCommentResource($this->whenLoaded('parentComment')),

            // Include replies if loaded
            'replies' => StringsCommentResource::collection($this->whenLoaded('replies')),

            // Include reply count
            'replies_count' => $this->whenCounted('replies'),

            'links' => [
                'self' => route('strings.comments.show', [$this->string_id, $this->id]),
                'string' => route('strings.show', $this->string_id)
            ]
        ];
    }
}
