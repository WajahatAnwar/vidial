<?php

namespace App\Models\VirtualOptions;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class OptionAssignedSet extends Pivot
{
    use HasFactory;

    protected $connection = 'virtual_options_conn';

    public $table = 'option_assigned_sets';

    protected $fillable = [
        'option_id', 'option_set_id'
    ];

    public function option_sort()
    {
        return $this->belongsTo(Option::class, 'option_id', 'id');
    }
}
