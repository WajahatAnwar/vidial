<?php

namespace App\Imports\OrderSplitter;

use App\Models\OrderSplitter\OSVendor;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class VendorsImport implements ToModel, WithHeadingRow
{
    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */

    public function model(array $row)
    {
        $myString = $row['vendors_tags'];
        $myArray = explode(',', $myString);

        return new OSVendor([
            'vendor_name' => $row['name'],
            'tags' => json_encode($myArray),
            'vendor_private_key' => $row['api_key'],
            'vendor_secret_key' => $row['secret_key'],
            'vendor_store_id' => $row['store_id'],
            'vendor_warehouse_id' => $row['warehouse_id'],
        ]);
    }
}
