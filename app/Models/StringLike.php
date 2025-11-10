<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StringLike extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'string_likes';

    /**
     * Indicates if the model should be timestamped.
     * Set to false since the table doesn't have updated_at column.
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
     * Indicates if the model has a primary key.
     *
     * @var bool
     */
    protected $primaryKey = null;


    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'string_id',
        'user_id',
        // Add other columns as needed
    ];
}
