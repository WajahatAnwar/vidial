<?php

namespace App\Models\SizeChart;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SCRule extends Model
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
        'status',
        'data'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'data' => 'object'
    ];

    public function size_chart()
    {
        return $this->hasOne(SCSizeChart::class, 'rule_id');
    }
}
