<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InconnectIntactField extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    public function mapping_forward()
    {
        return $this->belongsTo(ShopifyOrderField::class, 'shopify_order_field_id');
    }
}
