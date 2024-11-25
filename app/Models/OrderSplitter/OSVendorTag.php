<?php

namespace App\Models\OrderSplitter;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OSVendorTag extends Model
{
    use HasFactory;

    protected $connection = 'order_splitter_conn';
}
