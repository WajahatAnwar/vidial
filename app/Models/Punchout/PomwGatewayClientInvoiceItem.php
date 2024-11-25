<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PomwGatewayClientInvoiceItem extends Model
{
    use HasFactory;

    protected $connection = 'punchout_conn';

    public function invoice(){
        return $this->belongsTo(PomwGatewayClientInvoice::class, 'invoice_id', 'id');
    }

    public function getQuantity()
    {
        if ($this->invoice->isCreditMemo() && $this->invoice->order->pomw_client->shouldCreditMemoItemQuantitiesBeNegative())
            return $this->quantity * -1;

        return $this->quantity;
    }
    public function getUnitPrice()
    {
        if ($this->invoice->isCreditMemo() && $this->invoice->order->pomw_client->shouldCreditMemoAmountsBeNegative())
            return $this->unit_price * -1;

        return $this->unit_price;
    }
}
