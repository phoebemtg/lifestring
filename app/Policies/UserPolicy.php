<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Support\Facades\Log;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view a list of all users.
     */
    public function viewAny(User $user): bool
    {
        // Only admins can see a list of all users.
        Log::info('UserPolicy@viewAny was executed for user ID: ' . $user->id);

        return true;

    }

    /**
     * Determine whether the user can view a specific user's profile.
     */
    public function view(User $user, User $model): bool
    {
        // Any authenticated user can view any profile.
        return true;
    }

    /**
     * Determine whether the user can update a user's profile.
     */
    public function update(User $user, User $model): bool
    {
        // An admin can update any profile, or a user can update their own.
        // A moderator CANNOT edit user profiles.
        return $user->isAdmin() || $user->id === $model->id;
    }

    /**
     * Determine whether the user can delete a user's profile.
     */
    public function delete(User $user, User $model): bool
    {
        // Only admins can delete profiles (or a user can delete their own).
        return $user->isAdmin() || $user->id === $model->id;
    }
}
