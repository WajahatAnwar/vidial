<?php

namespace App\Exports\InConnect;

use App\Models\InConnect\InconnectOrder;
use App\Models\InConnect\VendorPurchaseOrder;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class OrderExport implements FromCollection, WithHeadings, WithMapping
{
    protected $data;
    public $tracking = false;
    public $export_base = "";

    public function __construct($data, $tracking = false, $export_base = "vendor_purchase_order")
    {
        $this->data = $data;
        $this->tracking = $tracking;
        $this->export_base = $export_base;
    }

    public function collection()
    {
        if($this->tracking){
            $data_process = VendorPurchaseOrder::with(['inconnectOrder.decorator', 'vendor']);
            if($this->export_base == "vendor_purchase_order") 
                return $data_process->whereIn('id', $this->data)->get();
            else if($this->export_base == "inconnect_order")
                return $data_process->whereIn('inconnect_order_id', $this->data)->get();
        }
        
        return  VendorPurchaseOrder::with(['inconnectOrder.decorator', 'vendor'])->whereIn('inconnect_order_id', $this->data)->get();
    }

    public function headings(): array
    {
        return [
            'Order Name',
            'Decorator',
            'Decorator PO #',
            'Vendor',
            'Vendor PO #',
            'Transaction ID',
            'Vendor Invoice #',
            'Tracking #',
        ];
    }

    public function map($order): array
    {
        return [
            $order->inconnectOrder->shopify_order_name,
            $order?->inconnectOrder?->decorator?->name ?? '-',
            $order?->inconnectOrder?->decorator_order_id ?? '-',
            $order?->vendor?->name ?? '-',
            $order?->purchase_order_no ?? '-',
            $order?->po_number ?? '-',
            $order?->invoice_number ?? '-',
            $order->tracking_number ?? '-',
        ];
    }
}
