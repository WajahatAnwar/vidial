<?php

namespace App\Models\Cropica;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class CropicaSubJob extends Pivot
{
    use HasFactory;

    protected $connection = 'cropica_conn';
}
