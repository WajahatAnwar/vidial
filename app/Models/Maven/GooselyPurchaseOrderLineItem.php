<?php

namespace App\Models\Maven;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GooselyPurchaseOrderLineItem extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    protected $fillable = [
        'goosely_purchase_order_id',
        'item_id',
        'quantity',
        'price',
        'location_id',
        'department_id',
    ];
}
