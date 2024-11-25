<?php

namespace App\Models\Filter;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FilterLabel extends Model
{
    use HasFactory;

    protected $connection = 'filter_conn';

    protected $fillable = [
        'filter_id',
        'label',
        'sort_number'
    ];

    public function values()
    {
        return $this->hasMany(FilterLabelValue::class);
    }
}
