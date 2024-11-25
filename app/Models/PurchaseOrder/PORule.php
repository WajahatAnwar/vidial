<?php

namespace App\Models\PurchaseOrder;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PORule extends Model
{
    use HasFactory;

    protected $connection = 'purchase_order_conn';

    public function stores()
    {
        return $this->hasMany(POStoreRule::class, 'rule_id', 'id');
    }
}
