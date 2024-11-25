<?php

namespace App\Models\Filter;

use App\Models\VirtualOptions\Family;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FilterColor extends Model
{
    use HasFactory;

    protected $connection = 'filter_conn';

    protected $fillable = [
        'filter_id',
        'family_id',
        'sort_number',
    ];

    public function family()
    {
        return $this->belongsTo(Family::class, 'family_id', 'id');
    }
}
