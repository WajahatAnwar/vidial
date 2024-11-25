<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\InConnect\InconnectOrder;

class OrderEntry extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    protected $fillable = [
        'user_id',
        'gooselyStatus',
        'intacctStatus',
        'vendorStatus',
        'decoratorStatus',
        'noCustomer',
        'cancelByRule',
        'fraudOrder',
        'fraudOrderTwo',
        'inconnect_order_id',
        'order_name',
        'ordersCreateJob',
        'realOrdersCreateJob',
        'orderCreateJob',
        'intacctSalesOrderJobSales',
        'intacctSalesOrderJobInvoice',
        'vendorOrderJob',
        'intacctOrderCreateJobVendor',
        'decideDecorator',
        'idexOrderJob',
        'screenProJob',
        'intacctOrderCreateJobDecorator',
        'vendorInvoice',
    ];

    public function inconnectOrder(){
        return $this->belongsTo(InconnectOrder::class);
    }
}
