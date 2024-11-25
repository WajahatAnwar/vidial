<?php

namespace App\Models\AllInOne;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderLineItem extends Model
{
    use HasFactory;

    protected $connection = 'all_in_one_conn';

    protected $fillable = [
        'user_id', 'local_order_id', 'line_item_id', 'order_id', 'product_id', 'name', 'price', 'quantity', 'weight'
    ];
}
