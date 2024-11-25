<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vendor extends Model
{
    use HasFactory, SoftDeletes;

    protected $connection = 'in_connect_conn';

    protected $casts = [
        'created_at' => 'date:m-d-Y',
    ];

    protected $fillable = [
        'name',
        'allow_processing',
        'po_prefix',
        'so_prefix',
        'intact_vendor_id',
        'notes',
        'username',
        'password',
        'product_data_endpoint',
        'purchase_order_endpoint',
        'pricing_and_configuration_endpoint',
        'invoice_endpoint',
        'intact_location_id',
        'intact_department_id',
        'shipping_method',
        'shipment_endpoint'
    ];

    public function address()
    {
        return $this->morphOne(Address::class, 'addressable');
    }

    public function intactVendor()
    {
        return $this->belongsTo(IntactVendor::class);
    }
    public function intactLocation()
    {
        return $this->belongsTo(IntactLocation::class);
    }

    public function intactDepartment()
    {
        return $this->belongsTo(IntactDepartment::class);
    }

    public function shopifyVendors()
    {
        return $this->belongsToMany(ShopifyVendor::class);
    }

    // define inconnect orders relation for vendor
    public function inconnectOrders()
    {
        return $this->hasManyThrough(InconnectOrder::class, VendorPurchaseOrder::class, 'vendor_id', 'vendor_purchase_order_id', 'id', 'id');
    }

    public function logs()
    {
        return $this->morphMany(InconnectLog::class, 'loggable');
    }

    public function vendorPurchaseOrders()
    {
        return $this->hasMany(VendorPurchaseOrder::class, 'vendor_id');
    }
}
