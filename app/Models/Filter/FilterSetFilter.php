<?php

namespace App\Models\Filter;

use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;

class FilterSetFilter extends Pivot
{
    use HasFactory;

    protected $connection = 'filter_conn';

    public $table = 'filter_set_filters';

    protected $fillable = [
        'filter_set_id',
        'filter_id',
        'sort_number'
    ];

    public function filter_sort()
    {
        return $this->belongsTo(Filter::class, 'filter_id', 'id');
    }
}
