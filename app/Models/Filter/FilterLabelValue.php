<?php

namespace App\Models\Filter;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FilterLabelValue extends Model
{
    use HasFactory;

    protected $connection = 'filter_conn';

    protected $fillable = [
        'filter_label_id',
        'label',
        'filter_data_id'
    ];

    public function filter_data()
    {
        return $this->belongsTo(FilterData::class, 'filter_data_id', 'id');
    }
}
