<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IntactVendor extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    protected $fillable = [
        'vendor_id',
        'name',
    ];
}
