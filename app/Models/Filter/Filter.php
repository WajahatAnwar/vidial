<?php

namespace App\Models\Filter;

use App\Models\VirtualOptions\Family;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Filter extends Model
{
    use HasFactory;

    protected $connection = 'filter_conn';

    protected $fillable = [
        'name',
        'frontend_name',
        'filter_type_id',
        'default_state_id',
        'multi_select',
        'sort_type_id',
        'show_swatches'
    ];

    public function labels()
    {
        return $this->hasMany(FilterLabel::class);
    }

    public function families()
    {
        return $this->hasMany(FilterColor::class);
    }

    public function filter_sets()
    {
        return $this->belongsToMany(FilterSet::class, 'filter_set_filters', 'filter_id', 'filter_set_id')->using(FilterSetFilter::class)->withTimestamps();
    }

    public function filter_type()
    {
        return $this->belongsTo(FilterType::class, 'filter_type_id', 'id');
    }

    public function sort_type()
    {
        return $this->belongsTo(SortType::class, 'sort_type_id', 'id');
    }

    public function default_state()
    {
        return $this->belongsTo(DefaultState::class, 'default_state_id', 'id');
    }
}
