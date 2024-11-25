<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InconnectShipping extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    public function shipping_origin()
    {
        return $this->belongsTo(ShopifyShippingField::class, 'shopify_shipping_field_id');
    }
}
