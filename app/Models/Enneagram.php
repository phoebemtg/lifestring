<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Enneagram extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'enneagrams';

    /**
     * Indicates if the model should be timestamped.
     * The schema does not have created_at/updated_at columns.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'type_number',
        'name',
        'description',
        'attributes',
    ];

    /**
     * The attributes that should be cast.
     * Automatically converts the JSONB column to and from a PHP array.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'attributes' => 'array',
    ];

    /**
     * The users that have been assigned this Enneagram type.
     * Defines the inverse of the many-to-many relationship.
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_enneagrams', 'enneagram_id', 'user_id');
    }
}
