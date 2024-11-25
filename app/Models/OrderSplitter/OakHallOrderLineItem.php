<?php

namespace App\Models\OrderSplitter;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OakHallOrderLineItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $connection = 'order_splitter_conn';
    protected $fillable = [
        'oak_hall_order_id',
        'line_number',
        'description',
        'product_id',
        'quantity',
        'book_store_cost',
        'vendor_item_no',
        'return_address_name',
        'return_address_street',
        'return_address_street_details',
        'return_address_zip_code',
        'return_address_city',
        'return_address_state',
        'return_address_country_code',
        'return_address_contact_name',
        'return_address_contact_phone',
        'return_address_contact_email'
    ];
}
