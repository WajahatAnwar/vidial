<?php

namespace App\Exports\PurchaseOrder;

use App\Models\PurchaseOrder\POCSVRecord;
use Maatwebsite\Excel\Concerns\FromCollection;

class CSVRecordExport implements FromCollection
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return POCSVRecord::get(['handle_name','min_quantity']);
    }
}
