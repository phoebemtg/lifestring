<?php

namespace App\Policies;

use App\Models\String;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class StringPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any strings.
     */
    public function viewAny(User $user): bool
    {
        // Any authenticated user can view strings
        return true;
    }

    /**
     * Determine whether the user can view the string.
     */
    public function view(User $user, String $string): bool
    {
        // Any authenticated user can view any string
        return true;
    }

    /**
     * Determine whether the user can create strings.
     */
    public function create(User $user): bool
    {
        // Any authenticated user can create strings
        return true;
    }

    /**
     * Determine whether the user can update the string.
     */
    public function update(User $user, String $string): bool
    {
        // Users can only update their own strings, or admins/mods can update any string
        return $user->isAdmin() || $user->isMod() || $user->user_id === $string->user_id;
    }

    /**
     * Determine whether the user can delete the string.
     */
    public function delete(User $user, String $string): bool
    {
        // Users can only delete their own strings, or admins/mods can delete any string
        return $user->isAdmin() || $user->isMod() || $user->user_id === $string->user_id;
    }

    /**
     * Determine whether the user can comment on the string.
     */
    public function comment(User $user, String $string): bool
    {
        // Any authenticated user can comment on any string
        return true;
    }
}
