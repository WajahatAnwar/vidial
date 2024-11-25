<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InconnectApplicationStatus extends Model
{
    use HasFactory;



    protected $fillable = [
        'application_status_id', 'type'
    ];
}
