<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;



    protected $fillable = [
        'user_id',
        'order_name',
        'order_id',
        'email',
        'contact_email',
        'phone_no',
        'order_created_at',
        'customer_name',
        'total',
        'final_total',
        'payment_status',
        'fulfillment_status',
        'customer_id',
        'cancelled_at',
        'cancel_reason',
        'is_fraud',
        'on_hold',
        'payload',
        'restriction_id'
    ];

    protected $casts = [
        'payload' => 'object',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function refunds()
    {
        return $this->hasMany(Refund::class, 'local_order_id', 'id');
    }

    public function line_items()
    {
        return $this->hasMany(OrderLineItem::class, 'local_order_id', 'id');
    }
}
