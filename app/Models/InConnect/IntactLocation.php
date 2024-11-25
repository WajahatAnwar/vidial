<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IntactLocation extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    protected $fillable = [
        'location_id',
        'name',
    ];
}
