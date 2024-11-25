<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExternalChargePrice extends Model
{
    use HasFactory;



    protected $fillable = [
        'external_charge_id', 'charge_price'
    ];
}
