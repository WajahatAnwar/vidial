<?php

namespace App\Models\AllInOne;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExternalCharge extends Model
{
    use HasFactory;

    protected $connection = 'all_in_one_conn';

    protected $fillable = [
        'charge_id', 'charge_name', 'external_decoration_id'
    ];

    public function charge_price_conn()
    {
        return $this->hasMany(ExternalChargePrice::class, 'external_charge_id', 'id');
    }
}
