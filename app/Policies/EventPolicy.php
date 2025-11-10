<?php

namespace App\Policies;

use App\Models\Event;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class EventPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any events.
     */
    public function viewAny(User $user): bool
    {
        // Any authenticated user can view events
        return true;
    }

    /**
     * Determine whether the user can view the event.
     */
    public function view(User $user, Event $event): bool
    {
        // Any authenticated user can view any event
        return true;
    }

    /**
     * Determine whether the user can create events.
     */
    public function create(User $user): bool
    {
        // Any authenticated user can create events
        return true;
    }

    /**
     * Determine whether the user can update the event.
     */
    public function update(User $user, Event $event): bool
    {
        // Users can only update their own events, or admins can update any event
        return $user->isAdmin() || $user->user_id === $event->user_id;
    }

    /**
     * Determine whether the user can delete the event.
     */
    public function delete(User $user, Event $event): bool
    {
        // Users can only delete their own events, or admins can delete any event
        return $user->isAdmin() || $user->user_id === $event->user_id;
    }
}
