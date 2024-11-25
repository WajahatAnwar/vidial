<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PomwGatewayClientConfirmedOrder extends Model
{
    use HasFactory;

    protected $connection = 'punchout_conn';

    public function shipping_address()
    {
        return $this->belongsTo(PomwStreetAddress::class, 'shipping_address_id', 'id');
    }

    public function billing_address()
    {
        return $this->belongsTo(PomwStreetAddress::class, 'billing_address_id', 'id');
    }

    public function confirmed_order_items()
    {
        return $this->hasMany(PomwGatewayClientConfirmedOrderItem::class, 'order_id', 'id');
    }

    public function order(){
        return $this->belongsTo(PomwGatewayClientOrder::class, 'order_id', 'id');
    }
}
