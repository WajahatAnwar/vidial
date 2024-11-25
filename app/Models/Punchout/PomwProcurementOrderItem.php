<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PomwProcurementOrderItem extends Model
{
    use HasFactory;

    protected $connection = 'punchout_conn';

    protected $appends = [
        'total',
    ];

    public function getTotalAttribute()
    {
        return $this->quantity * $this->unit_price;
    }
}
