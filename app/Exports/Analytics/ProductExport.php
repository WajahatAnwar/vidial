<?php

namespace App\Exports\Analytics;

use App\Models\AllInOne\ProductVariant;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ProductExport implements FromCollection, WithHeadings, WithMapping
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        return ProductVariant::with(['product.user', 'product.collections'])->whereIn('id', $this->data)->get();
    }
    public function headings(): array
    {
        return [
            'Product',
            'Store',
            'Collection',
            'Inventory',
            'Status',
            'Price',
            // Add more columns here as needed
        ];
    }

    public function map($variant): array
    {
        return [
            $variant->product->product_title .' '. $variant->title,
            $variant->product->user->name,
            $variant->product->collections[0]->collection_handle ?? 'N/A',
            $variant->quantity . 'in stocks',
            $variant->product->status,
            $variant->price,
        ];
    }
}
