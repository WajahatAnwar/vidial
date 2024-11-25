<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PomwGatewayClientOrderItem extends Model
{
    use HasFactory;

    protected $connection = 'punchout_conn';

    public function pomw_order()
    {
        return $this->belongsTo(PomwGatewayClientOrder::class, 'order_id');
    }
}
