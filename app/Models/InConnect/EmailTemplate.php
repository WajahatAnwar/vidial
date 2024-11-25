<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    protected $fillable = [
        'name',
        'subject',
        'body',
        'is_active',
        'inconnect_order_status_id',
        'send_at',
        'send_after',
        'ignore_users',
        'pop_shop_status'
    ];

    public function inconnectOrderStatus()
    {
        return $this->belongsTo(InconnectOrderStatus::class);
    }
}
