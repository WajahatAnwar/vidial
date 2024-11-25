<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DecoratorStockVendor extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    protected $fillable = [
        'decorator_id',
        'shopify_vendor_id',
    ];

    public function shopify_vendor()
    {
        return $this->belongsTo(ShopifyVendor::class, 'shopify_vendor_id', 'id');
    }
}
