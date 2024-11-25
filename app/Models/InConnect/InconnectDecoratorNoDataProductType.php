<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InconnectDecoratorNoDataProductType extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    protected $fillable = [
        'inconnect_decorator_id',
        'product_type_id',
    ];

    public function product_type()
    {
        return $this->belongsTo(ProductType::class, 'product_type_id', 'id');
    }
}
