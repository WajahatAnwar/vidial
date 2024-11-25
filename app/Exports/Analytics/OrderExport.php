<?php

namespace App\Exports\Analytics;

use App\Models\AllInOne\Order;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class OrderExport implements FromCollection, WithHeadings, WithMapping
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        return Order::with('user')->whereIn('id', $this->data)->get();
    }
    public function headings(): array
    {
        return [
            'Order',
            'Store',
            'Date',
            'Customer',
            'Sub Total',
            'Order Total',
            'Payment Status',
            'Fulfilment Status'
            // Add more columns here as needed
        ];
    }

    public function map($order): array
    {
        return [
            $order->order_id,
            $order->user->name,
            $order->order_created_at,
            $order->customer_name,
            $order->total,
            $order->final_total,
            $order->payment_status,
            $order->fulfillment_status,
        ];
    }
}
