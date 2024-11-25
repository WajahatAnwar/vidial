<?php

namespace App\Models\PurchaseOrder;

use App\Models\AllInOne\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class POOrder extends Model
{
    use HasFactory;

    protected $connection = 'purchase_order_conn';

    public function order_user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
