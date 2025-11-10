<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Casts\AsCollection;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasUuids;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'user_profiles';

    /**
     * Indicates if the model's ID is auto-incrementing.
     * The primary key 'id' on user_profiles is a UUID, so this is false.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The data type of the auto-incrementing ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'contact_info',
        'social_links',
        'attributes',
        'biography',
        'meta',
        'is_admin',
        'is_mod'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'contact_info' => 'array',
        'social_links' => 'array',
        'attributes' => 'array',
        'biography' => 'array',
        'meta' => 'array',
        'is_admin' => 'boolean',
        'is_mod'   => 'boolean'
    ];

    /**
     * Check if the user is an administrator.
     */
    public function isAdmin(): bool
    {
        return $this->is_admin === true;
    }

    /**
     * Check if the user is a moderator.
     */
    public function isMod(): bool
    {
        return $this->is_mod === true;
    }

    //======================================================================
    //  RELATIONSHIPS
    //======================================================================

    /**
     * Get the roles associated with the user's profile.
     * Defines a many-to-many relationship with the Role model.
     * We specify 'user_id' as the key on both the pivot table and this model's table.
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles', 'user_id', 'role_id', 'user_id', 'id');

    }

    /**
     * Get the Enneagram types assigned to the user's profile.
     * Defines a many-to-many relationship with the Enneagram model.
     * We specify 'user_id' as the key on both the pivot table and this model's table.
     */
    public function enneagrams()
    {
        return $this->belongsToMany(Enneagram::class, 'user_enneagrams', 'user_id', 'enneagram_id', 'user_id');
    }

    /**
     * Get the events belonging to the user.
     * Defines a one-to-many relationship with the Event model.
     */
    public function events()
    {
        return $this->hasMany(Event::class, 'user_id', 'user_id');
    }

    /**
     * Get the strings created by this user.
     */
    public function strings(): HasMany
    {
        return $this->hasMany(Strings::class, 'user_id', 'user_id');
    }

    /**
     * Get all recommendations for this user
     */
    public function recommendations()
    {
        return $this->hasMany(UserRecommendation::class, 'user_id', 'user_id');
    }

    /**
     * Get all recommendations where this user is recommended to others
     */
    public function recommendedTo()
    {
        return $this->hasMany(UserRecommendation::class, 'recommended_user_id', 'user_id');
    }

    /**
     * Get strings liked by this user.
     */
    public function likedStrings(): BelongsToMany
    {
        return $this->belongsToMany(
            Strings::class,
            'string_likes',
            'user_id',
            'string_id',
            'user_id',
            'id'
        )->withTimestamps();

    }

    public function rooms(): BelongsToMany
    {
        return $this->belongsToMany(
            Room::class,
            'room_participants',
            'user_id',
            'room_id',
            'user_id',
            'id'
        );
    }

    /**
     * Get outgoing connection requests from this user.
     */
    public function sentConnections(): HasMany
    {
        return $this->hasMany(UserConnection::class, 'requester_id', 'user_id');
    }

    /**
     * Get incoming connection requests to this user.
     */
    public function receivedConnections(): HasMany
    {
        return $this->hasMany(UserConnection::class, 'receiver_id', 'user_id');
    }

    /**
     * Get all users connected to this user (with accepted status).
     */
    public function connections(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'user_connections',
            'requester_id',
            'receiver_id',
            'user_id',
            'user_id'
        )->wherePivot('status', 'accepted')
        ->union(
            $this->belongsToMany(
                User::class,
                'user_connections',
                'receiver_id',
                'requester_id',
                'user_id',
                'user_id'
            )->wherePivot('status', 'accepted')
        );
    }

    /**
     * Get comments made by this user.
     */
    public function stringComments(): HasMany
    {
        return $this->hasMany(StringsComment::class, 'user_id', 'user_id');
    }

    //======================================================================
    //  AUTHORIZATION HELPER METHODS
    //======================================================================

    /**
     * Check if the user has a specific role.
     *
     * @param string $roleName The name of the role (e.g., 'super_admin').
     * @return bool
     *
     * @example $user->hasRole('super_admin');
     */
    public function hasRole(string $roleName): bool
    {
        return $this->roles->contains('name', $roleName);
    }

    //=====================================================================

    /**
     * Check if the user has a specific permission through their roles.
     *
     * This is the primary method for checking abilities. It fetches all permissions
     * from all of the user's roles, caches them, and then checks if the
     * requested permission exists in that collection.
     *
     * @param string $permissionName The name of the permission (e.g., 'posts:edit-any').
     * @return bool
     *
     * @example $user->hasPermissionTo('posts:edit-any');
     */
    public function hasPermissionTo(string $permissionName): bool
    {
        // Caching is crucial for performance. This avoids re-querying the database
        // for permissions on every single check within the same request lifecycle
        // or across multiple requests. The cache is invalidated when roles change.
        $permissions = Cache::rememberForever("user_{$this->id}_permissions", function () {
            // flatMap iterates through the user's roles, and for each role,
            // it returns its permissions. The results are flattened into a
            // single collection of permissions.
            return $this->roles->flatMap(function ($role) {
                return $role->permissions->pluck('name');
            })->unique();
        });

        return $permissions->contains($permissionName);
    }
}
