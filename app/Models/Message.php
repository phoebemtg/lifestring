<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasUuids;
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'messages';

    /**
     * Indicates if the model's ID is auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * The data type of the primary key.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'room_id',
        'user_id',
        'content',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'id' => 'string',
        'room_id' => 'string',
        'user_id' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the room that this message belongs to.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'room_id', 'id');
    }

    /**
     * Get the user who sent this message.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    /**
     * Scope a query to only include messages for a specific room.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $roomId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeInRoom($query, $roomId)
    {
        return $query->where('room_id', $roomId);
    }

    /**
     * Scope a query to only include messages from a specific user.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $userId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeFromUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Get the last few messages for a conversation.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeRecent($query, $limit = 15)
    {
        return $query->latest()->limit($limit);
    }
}
