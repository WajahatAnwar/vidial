<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PomwGatewayClientTierPriceDiscountProduct extends Model
{
    use HasFactory;

    protected $connection = 'punchout_conn';

    public function discount()
    {
        return $this->belongsTo(PomwGatewayClientTierPriceDiscount::class, 'discount_id');
    }
}
