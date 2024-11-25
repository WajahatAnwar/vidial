<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KlavioCredential extends Model
{
    use HasFactory;
    public $fillable = [
        'user_id',
        'email',
        'api_key',
    ];

    // write accessor for decrypt api_key
    public function getApiKeyAttribute($value)
    {
        return decrypt($value);
    }
}
