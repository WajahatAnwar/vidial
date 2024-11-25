<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'customer_id',
        'customer_created_at',
        'first_name',
        'last_name',
        'email',
        'phone',
        'company',
        'address',
        'apartment',
        'city',
        'state',
        'zip',
        'country',
        'addresses',
        'full_name',
        'orders_count',

    ];
}
