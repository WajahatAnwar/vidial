<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExternalDecoration extends Model
{
    use HasFactory;



    protected $fillable = [
        'decoration_id', 'decoration_name', 'external_location_id', 'decoration_default'
    ];

    public function charge_conn()
    {
        return $this->hasMany(ExternalCharge::class, 'external_decoration_id', 'id');
    }
}
