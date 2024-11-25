<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ShopifyVendorVendor extends Pivot
{
    protected $table = 'shopify_vendor_vendor';

    protected $connection = 'in_connect_conn';

    protected $fillable = [
        'vendor_id',
        'shopify_vendor_id'
    ];

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function shopifyVendor()
    {
        return $this->belongsTo(ShopifyVendor::class);
    }
}
