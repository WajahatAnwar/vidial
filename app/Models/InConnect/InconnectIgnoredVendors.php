<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;

class InconnectIgnoredVendors extends Pivot
{
    use HasFactory;

    protected $table = 'inconnect_ignored_vendors';

    protected $connection = 'in_connect_conn';
}
