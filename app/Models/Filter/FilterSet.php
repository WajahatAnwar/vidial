<?php

namespace App\Models\Filter;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class FilterSet extends Model
{
    use HasFactory;

    protected $connection = 'filter_conn';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->table = DB::connection('filter_conn')->getDatabaseName() . '.filter_sets';
    }

    protected $fillable = [
        'name'
    ];

    public function filters()
    {
        return $this->belongsToMany(Filter::class, 'filter_set_filters', 'filter_set_id', 'filter_id')->using(FilterSetFilter::class)->withPivot(['sort_number'])->withTimestamps();
    }
}
