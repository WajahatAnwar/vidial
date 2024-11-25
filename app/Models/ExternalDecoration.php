<?php

namespace App\Models\AllInOne;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExternalDecoration extends Model
{
    use HasFactory;

    protected $connection = 'all_in_one_conn';

    protected $fillable = [
        'decoration_id', 'decoration_name', 'external_location_id', 'decoration_default'
    ];

    public function charge_conn()
    {
        return $this->hasMany(ExternalCharge::class, 'external_decoration_id', 'id');
    }
}
