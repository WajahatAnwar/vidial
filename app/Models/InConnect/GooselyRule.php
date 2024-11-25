<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GooselyRule extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    protected $fillable = [
        'product_type_id',
        'shopifyOrder',
        'intacctOrder',
    ];

    public function product_type()
    {
        return $this->belongsTo(ProductType::class);
    }
}
