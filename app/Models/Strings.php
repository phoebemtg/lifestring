<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Strings extends Model
{
    use HasFactory, HasUuids;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'strings';

    /**
     * Indicates if the model's ID is auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The data type of the primary key.
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
        'content_text',
        'content_images',
        'stringable_id',
        'stringable_type',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'content_images' => 'array',
        'likes_count' => 'integer',
        'comments_count' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the string.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get all comments for the string.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(StringsComment::class, 'string_id');
    }

    /**
     * Get users who liked this string.
     */
    public function likes(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'string_likes',
            'string_id',
            'user_id'
        )->withTimestamps();
    }

    /**
     * Get the parent stringable model (polymorphic).
     */
    public function stringable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Check if a user has liked this string.
     *
     * @param string $userId
     * @return bool
     */
    public function isLikedBy(string $userId): bool
    {
        //return $this->likes()->where('user_id', $userId)->exists();
        return $this->likes()->where('string_likes.user_id', $userId)->exists();

    }

    /**
     * Like a string.
     *
     * @param string $userId
     * @return bool
     */
    public function like(string $userId): bool
    {
        if (!$this->isLikedBy($userId)) {
            $this->likes()->attach($userId);
            $this->increment('likes_count');
            return true;
        }
        return false;
    }

    /**
     * Unlike a string.
     *
     * @param string $userId
     * @return bool
     */
    public function unlike(string $userId): bool
    {
        if ($this->isLikedBy($userId)) {
            $this->likes()->detach($userId);
            $this->decrement('likes_count');
            return true;
        }
        return false;
    }

    /**
     * Update the comments count.
     */
    public function updateCommentsCount(): void
    {
        $this->comments_count = $this->comments()->count();
        $this->save();
    }
}
