<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserEmbeds extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'user_embeddings';

    /**
     * The attributes that are mass assignable.
     *
     * This acts as a "whitelist" for columns that can be updated using
     * methods like `update()` or `create()`.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'embedding',
        'content_hash',
        'model_version',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * This is a critical step. It automatically converts the `vector` type
     * from the database (which Laravel sees as a string like '[1,2,3]')
     * into a native PHP array, and back again upon saving.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'embedding' => 'array',
    ];

    /**
     * Get the user that this embedding belongs to.
     *
     * This defines the inverse of a one-to-one or one-to-many relationship,
     * linking this embedding record back to the primary User model
     * that represents the 'auth.users' table.
     */
    public function user()
    {
        // Assumes you have a standard User model that corresponds to auth.users.
        // The foreign key 'user_id' on this table links to the 'id' on the users table.
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
