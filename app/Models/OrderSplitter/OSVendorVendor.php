<?php

namespace App\Models\OrderSplitter;

use App\Models\InConnect\ShopifyVendor;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OSVendorVendor extends Model
{
    use HasFactory;

    protected $connection = 'order_splitter_conn';

    public function shopify_vendor()
    {
        return $this->belongsTo(ShopifyVendor::class, 'shopify_vendor_id', 'id');
    }
}
