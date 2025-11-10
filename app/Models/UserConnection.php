<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserConnection extends Model
{

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'user_connections';

    /**
     * Indicates if the model has timestamps.
     *
     * @var bool
     */
    public $timestamps = true;

    /**
     * Indicates if the model's ID is auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;


    /**
     * The primary key for the model.
     *
     * @var array<int, string>
     */
    protected $primaryKey = ['requester_id', 'receiver_id'];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'requester_id',
        'receiver_id',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'requester_id' => 'string',
        'receiver_id' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Set the keys for a save update query.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    protected function setKeysForSaveQuery($query)
    {
        return $query->where('requester_id', $this->attributes['requester_id'])
                     ->where('receiver_id', $this->attributes['receiver_id']);
    }

    /**
     * Get the requester user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id', 'user_id');
    }

    /**
     * Get the receiver user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id', 'user_id');
    }
}
