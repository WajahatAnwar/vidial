<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    use HasFactory;
    protected $fillable = [
        'type',
        'send_to',
        'user_id',
        'customer_name',
        'customer_email',
        'email_type',
    ];
}
