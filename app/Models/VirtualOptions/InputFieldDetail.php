<?php

namespace App\Models\VirtualOptions;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InputFieldDetail extends Model
{
    use HasFactory;

    protected $connection = 'virtual_options_conn';

    public function option()
    {
        return $this->belongsTo(Option::class, 'option_id', 'id');
    }

    public function threads()
    {
        return $this->hasMany(InputFieldThread::class, 'input_field_detail_id', 'id');
    }
}
