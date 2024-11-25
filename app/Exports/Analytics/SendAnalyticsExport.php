<?php

namespace App\Exports\Analytics;

use App\Models\AllInOne\User;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class SendAnalyticsExport implements FromCollection, WithHeadings
{
    /**
     * @return \Illuminate\Support\Collection
     */

    public $data;

    public function __construct($data)
    {
        $this->data = $data;
        // Log::info(json_encode($this->data));
    }

    public function collection()
    {
        return collect($this->data);
    }

    public function headings(): array
    {
        return [
            'Date',
            'Store ID',
            'Store Name',
            'Revenue',
            'Refunds',
            'Average Order Value',
            'No. of Orders',
            'Unfulfilled Orders',
            'Fulfilled Orders',
            'Unpaid Orders',
            'Paid Orders',
            'Top Customer',
            'Top Product',
            'New Products',
            'New Collections',
            // Add more columns here as needed
        ];
    }
}
