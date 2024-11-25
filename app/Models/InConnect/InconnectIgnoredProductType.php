<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Relations\Pivot;

class InconnectIgnoredProductType extends Pivot
{
    protected $connection = 'in_connect_conn';

    protected $fillable = [
        'inconnect_account_id',
        'product_type_id',
    ];

    public function inconnectAccount()
    {
        return $this->belongsTo(InconnectAccount::class);
    }

    public function productType()
    {
        return $this->belongsTo(ProductType::class);
    }
}
