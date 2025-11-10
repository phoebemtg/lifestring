<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserRecommendations extends Model
{
    use HasUuids;

    /**
     * Define the possible recommendation statuses as constants for type safety and readability.
     */
    public const STATUS_GENERATED = 'generated';
    public const STATUS_VIEWED    = 'viewed';
    public const STATUS_DISMISSED = 'dismissed';
    public const STATUS_ACCEPTED  = 'accepted';

    /**
     * The table associated with the model.
     */
    protected $table = 'user_recommendations';

    /**
     * The attributes that are mass assignable.
     * This acts as a "whitelist" for columns that can be updated via mass assignment.
     */
    protected $fillable = [
        'user_id',
        'recommended_user_id',
        'similarity_score',
        'status',
        'context',
    ];

    /**
     * The attributes that should be cast to native types.
     * This ensures data is correctly typed when accessed on the model.
     */
    protected $casts = [
        'similarity_score' => 'float',
        'context'          => 'array',
        'status'           => 'string', // Changed from Enum class to a simple string cast
    ];

    // ======================================================================
    //  RELATIONSHIPS
    // ======================================================================

    /**
     * Get the user profile that this recommendation is FOR.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        // This links the 'user_id' column on this table to the 'user_id'
        // column on the 'user_profiles' table (represented by the User model).
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    /**
     * Get the user profile that is BEING RECOMMENDED.
     *
     * @return BelongsTo
     */
    public function recommendedUser(): BelongsTo
    {
        // This links the 'recommended_user_id' column on this table to the 'user_id'
        // column on the 'user_profiles' table.
        return $this->belongsTo(User::class, 'recommended_user_id', 'user_id');
    }
}
