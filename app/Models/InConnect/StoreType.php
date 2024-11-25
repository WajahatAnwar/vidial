<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoreType extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';
}
