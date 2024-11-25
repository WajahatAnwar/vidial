<?php

namespace App\Models\OrderSplitter;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OakHallOrder extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $connection = 'order_splitter_conn';
    protected $fillable = [
        'external_order_id',
        'shipstation_order_id',
        'user_id',
        'customer_name',
        'customer_street',
        'customer_street_details',
        'customer_zip_code',
        'customer_city',
        'customer_state',
        'customer_country_code',
        'customer_contact_name',
        'customer_contact_phone',
        'customer_contact_email',
        'customer_id',
        'shipping_name',
        'shipping_street',
        'shipping_street_details',
        'country_code',
        'state',
        'city',
        'zip_code',
        'street_details',
        'street',
        'customer_phone_no',
        'comment',
        'order_status',
        'customer_email',
        'shipment_status'
    ];

    public function orderLineItems()
    {
        return $this->hasMany(OakHallOrderLineItem::class);
    }
}
