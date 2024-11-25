<?php

namespace App\Exports\InConnect;

use App\Models\InConnect\InconnectOrder;
use App\Models\InConnect\VendorPurchaseOrder;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class FailedOrderExport implements FromCollection, WithHeadings, WithMapping
{
    protected $data;  
    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    { 
        $orders = InconnectOrder::with(['user.inconnect_account.fraud_statuses', 'manual_user', 'vendor', 'decorator', 'updates', 'vendorPurchaseOrders.vendor'])->whereIn('id', $this->data)->get();
        return $orders;        
    }

    public function headings(): array
    {
        return [
            'Order Name',
            'Store',
            'Decorator',
            'Decorator PO #',
            'Vendor',
            'Vendor PO #',
        ];
    }

    public function map($order): array
    {
        return [
            $order->shopify_order_name,
            $order->user->store_name,
            $order?->decorator?->name ?? '-',
            $order?->decorator_order_id ?? '-',
            $order?->vendor?->name ?? '-',
            $order?->purchase_orders->purchase_order_no ?? '-',
            $order?->invoice_number ?? '-',
            $order->tracking_number ?? '-',
        ];
    }
}
