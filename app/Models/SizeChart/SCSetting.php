<?php

namespace App\Models\SizeChart;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SCSetting extends Model
{
    use HasFactory;

    protected $connection = 'size_chart_conn';

    protected $fillable = [
        'button_text',
        'button_background',
        'button_text_color'
    ];
}
