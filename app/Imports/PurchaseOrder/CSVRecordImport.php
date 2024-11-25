<?php

namespace App\Imports\PurchaseOrder;

use App\Models\PurchaseOrder\POCSVRecord;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithStartRow;

class CSVRecordImport implements ToModel, WithStartRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */

    public function startRow(): int
    {
        return 2;
    }

    public function model(array $row)
    {
        return new POCSVRecord([
            'handle_name' => $row[0],
            'min_quantity' => $row[1],
        ]);
    }
}
