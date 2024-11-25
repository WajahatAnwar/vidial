<?php

namespace App\Models\PurchaseOrder;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class POLocationShipping extends Model
{
    use HasFactory;

    protected $connection = 'purchase_order_conn';
}
