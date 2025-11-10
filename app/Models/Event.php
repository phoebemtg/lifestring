<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Event extends Model
{
    use HasFactory, HasUuids;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'events';

    /**
     * Indicates if the model's ID is auto-incrementing.
     * The primary key 'id' is a UUID, so this is false.
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
        'title',
        'description',
        'start_time',
        'end_time',
        'location',
        'meta_data',
        'custom_fields'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'meta_data' => 'array',
        'custom_fields' => 'array',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'created_at' => 'datetime'
    ];

    /**
     * The name of the created at column.
     *
     * @var string
     */
    const CREATED_AT = 'created_at';

    /**
     * The name of the updated at column.
     * This field doesn't exist in the database schema.
     *
     * @var string|null
     */
    const UPDATED_AT = null;

    /**
     * Get the user that owns the event.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
