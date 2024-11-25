<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InconnectOrderVendorPrice extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    protected $fillable = [
        'vendor_id',
        'product_id',
        'part_id',
        'fob_id',
        'fob_state',
        'price',
        'price_type',
        'inconnect_order_id'
    ];

    public function order()
    {
        return $this->belongsTo(InconnectOrder::class, 'inconnect_order_id');
    }
    
    public function vendor()
    {
        return $this->belongsTo(Vendor::class, 'vendor_id');
    }
}
