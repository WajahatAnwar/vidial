<?php

namespace App\Models\VirtualOptions;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Condition extends Model
{
    use HasFactory;

    protected $connection = 'virtual_options_conn';

    public function option_back()
    {
        return $this->belongsTo(Option::class, 'dependent_option_id', 'id');
    }

    public function option_front()
    {
        return $this->belongsTo(Option::class, 'option_id', 'id');
    }
}
