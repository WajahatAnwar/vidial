<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;

class InconnectDecorator extends Pivot
{
    use HasFactory;

    protected $table = 'inconnect_decorators';

    protected $connection = 'in_connect_conn';

    public $incrementing = true;

    protected $primaryKey = 'id';

    public function shippings()
    {
        return $this->hasMany(InconnectShipping::class, 'inconnect_decorator_id');
    }

    public function no_data_product_types()
    {
        return $this->hasMany(InconnectDecoratorNoDataProductType::class, 'inconnect_decorator_id');
    }
}
