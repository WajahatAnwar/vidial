<?php

namespace App\Models\PurchaseOrder;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class POStoreRule extends Model
{
    use HasFactory;

    protected $connection = 'purchase_order_conn';

    public function rule()
    {
        return $this->belongsTo(PORule::class, 'rule_id', 'id');
    }
}
