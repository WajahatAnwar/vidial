<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GoogleDriveCred extends Model
{
    use HasFactory;

    protected $fillable = [
        'api_key',
        'secret_key',
        'folder_name',
        'user_id',
        'client_id'
    ];
}
