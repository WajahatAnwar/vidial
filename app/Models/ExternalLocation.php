<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExternalLocation extends Model
{
    use HasFactory;



    protected $fillable = [
        'location_id', 'location_name', 'location_rank'
    ];

    public function decoration_conn()
    {
        return $this->hasMany(ExternalDecoration::class, 'external_location_id', 'id');
    }
}
