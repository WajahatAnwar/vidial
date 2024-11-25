<?php

namespace App\Models\VirtualOptions;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OptionSet extends Model
{
    use HasFactory;

    protected $connection = 'virtual_options_conn';

    public function options()
    {
        return $this->belongsToMany(Option::class, 'option_assigned_sets', 'option_set_id', 'option_id')->using(OptionAssignedSet::class)->withPivot(['sort_number'])->withTimestamps();
    }

    public function options_sort()
    {
        return $this->hasMany(OptionAssignedSet::class,'option_set_id', 'id');
    }
}
