<?php

namespace App\Models\SizeChart;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SCSizeChart extends Model
{
    use HasFactory;

    protected $connection = 'size_chart_conn';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'top_text',
        'chart_data',
        'bottom_text',
        'rule_id',
        'status'
    ];

    public function rule()
    {
        return $this->belongsTo(SCRule::class, 'rule_id');
    }
}
