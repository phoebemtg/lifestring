<?php

namespace App\Policies;

use App\Models\StringsComment;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class StringsCommentPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can update the comment.
     */
    public function update(User $user, StringsComment $comment): bool
    {
        // Users can only update their own comments, or admins/mods can update any comment
        return $user->isAdmin() || $user->isMod() || $user->user_id === $comment->user_id;
    }

    /**
     * Determine whether the user can delete the comment.
     */
    public function delete(User $user, StringsComment $comment): bool
    {
        // Users can delete their own comments
        // Admins/mods can delete any comment
        // Users can also delete comments on their own strings
        return $user->isAdmin() ||
               $user->isMod() ||
               $user->user_id === $comment->user_id ||
               $user->user_id === $comment->string->user_id;
    }
}
