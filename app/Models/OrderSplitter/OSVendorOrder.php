<?php

namespace App\Models\OrderSplitter;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OSVendorOrder extends Model
{
    use HasFactory;

    protected $connection = 'order_splitter_conn';
}
