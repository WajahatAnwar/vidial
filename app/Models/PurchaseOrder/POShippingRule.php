<?php

namespace App\Models\PurchaseOrder;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class POShippingRule extends Model
{
    use HasFactory;

    protected $connection = 'purchase_order_conn';

    public function rule_rel()
    {
        return $this->belongsTo(PORuleType::class, 'p_o_rule_type_id');
    }
}
