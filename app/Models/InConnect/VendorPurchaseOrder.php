<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorPurchaseOrder extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    protected $fillable = [
        'inconnect_order_id',
        'po_number',
        'vendor_id',
        'intact_po_number',
        'invoice_number',
        'intact_invoice_number',
        'intact_payload',
        'purchase_order_no',
        'tracking_number',
        'ship_dates'
    ];

    protected $casts = [
        'intact_payload' => 'array'
    ];

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function inconnectOrder()
    {
        return $this->belongsTo(InconnectOrder::class);
    }
}
