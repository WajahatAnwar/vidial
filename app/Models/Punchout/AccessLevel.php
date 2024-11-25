<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccessLevel extends Model
{
    use HasFactory;
    protected $connection = 'punchout_conn';

    protected $fillable = [
        'uri',
        'name',
        'priority',
        'uuid'
    ];

}
