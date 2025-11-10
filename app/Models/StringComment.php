<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StringComment extends Model
{
    use HasFactory, HasUuids;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'string_comments';

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
        'string_id',
        'user_id',
        'parent_comment_id',
        'content'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the string that owns the comment.
     */
    public function string(): BelongsTo
    {
        return $this->belongsTo(String::class);
    }

    /**
     * Get the user who created the comment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent comment if this is a reply.
     */
    public function parentComment(): BelongsTo
    {
        return $this->belongsTo(StringComment::class, 'parent_comment_id');
    }

    /**
     * Get replies to this comment.
     */
    public function replies(): HasMany
    {
        return $this->hasMany(StringComment::class, 'parent_comment_id');
    }

    /**
     * Check if the comment is a reply to another comment.
     */
    public function isReply(): bool
    {
        return $this->parent_comment_id !== null;
    }

    /**
     * Update the parent string's comment count when a comment is created or deleted.
     */
    protected static function booted()
    {
        static::created(function ($comment) {
            $comment->string->increment('comments_count');
        });

        static::deleted(function ($comment) {
            $comment->string->decrement('comments_count');
        });
    }
}
