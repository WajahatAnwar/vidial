<?php

namespace App\Models\VirtualOptions;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TextareaDetail extends Model
{
    use HasFactory;

    protected $connection = 'virtual_options_conn';

    public function option()
    {
        return $this->belongsTo(Option::class, 'option_id', 'id');
    }
}
