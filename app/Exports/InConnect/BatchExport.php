<?php

namespace App\Exports\InConnect;

use App\Models\InConnect\InconnectOrder;
use App\Models\InConnect\VendorPurchaseOrder;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class BatchExport implements FromCollection, WithHeadings, WithMapping
{
    protected $data;  
    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    { 
       return $this->data;
    }

    public function headings(): array
    {
        return [
            'Order Name',
            'Batch Name',
            'Sku',
            'Quantity',
        ];
    }

    public function map($batchItems): array
    {
        return [
            $batchItems->inconnectOrder->shopify_order_name,
            $batchItems->batch->batchSetting->batch_name,
            $batchItems->sku,
            $batchItems->quantity ?? '-'
        ];
    }
}
