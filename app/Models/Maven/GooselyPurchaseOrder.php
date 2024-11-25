<?php

namespace App\Models\Maven;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GooselyPurchaseOrder extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    protected $fillable = [
        'due_date',
        'vendor_id',
        'reference_no',
        'document_no',
        'intacct_invoice_number',
        'intacct_purchase_order_id'
    ];

    public function line_items()
    {
        return $this->hasMany(GooselyPurchaseOrderLineItem::class, 'goosely_purchase_order_id', 'id');
    }
}
