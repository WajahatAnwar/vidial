<?php

namespace App\Models\VirtualOptions;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InputFieldsProduct extends Model
{
    use HasFactory;

    protected $connection = 'virtual_options_conn';
}
