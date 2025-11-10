<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StringEmbeds extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'string_embeddings';

    /**
     * The attributes that are mass assignable.
     *
     * This acts as a "whitelist" for columns that can be updated using
     * methods like `update()` or `create()`.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'string_id',
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
     * Get the string that owns the embedding.
     */
    public function string(): BelongsTo
    {
        return $this->belongsTo(Strings::class, 'string_id');
    }


}
