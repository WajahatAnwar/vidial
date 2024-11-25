<?php

namespace App\Exports\Analytics;

use App\Models\AllInOne\Collection;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\FromCollection;

class CollectionExport implements FromCollection, WithHeadings,WithMapping
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        return Collection::with('products.user')->whereIn('id', $this->data)->get();
    }
    public function headings(): array
    {
        return [
            'Collection',
            'Store',
            'Product'
            // Add more columns here as needed
        ];
    }

    public function map($collection): array{
        return [
            $collection->collection_title,
            $collection->user->name ??  'N/A',
            count($collection->products)
        ];
    }
}
