<?php

namespace App\Models\Maven;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MavenCall extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';
    protected $fillable = [
        'name',
        'payload',
        'response',
        'status'
    ];
}
