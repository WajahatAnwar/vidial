<?php

namespace App\Models\InConnect;

use App\Models\AllInOne\Product;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InconnectIgnoredProduct extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    public function product_origin()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
