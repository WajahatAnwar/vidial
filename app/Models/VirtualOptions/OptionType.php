<?php

namespace App\Models\VirtualOptions;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OptionType extends Model
{
    use HasFactory;

    protected $connection = 'virtual_options_conn';

    public function options()
    {
        return $this->hasMany(Option::class, 'option_type_id', 'id');
    }
}
