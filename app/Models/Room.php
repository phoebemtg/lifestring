<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Room extends Model
{
    use HasUuids;
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'rooms';

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
        'name',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'id' => 'string',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the participants (users) in this room.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'room_participants',
            'room_id',
            'user_id',
            'id',
            'user_id'
        );
    }

    /**
     * Get all messages in this room.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'room_id', 'id');
    }

    /**
     * Get the latest message in this room.
     *
     * @return \App\Models\Message|null
     */
    public function latestMessage()
    {
        return $this->messages()->latest('created_at')->first();
    }

    /**
     * Check if a user is a participant in this room.
     *
     * @param string $userId
     * @return bool
     */
    public function hasParticipant(string $userId): bool
    {
        return $this->participants()->where('room_participants.user_id', $userId)->exists();
    }
}
