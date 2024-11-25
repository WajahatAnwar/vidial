<?php

namespace App\Models\Analytics;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ALReportLog extends Model
{
    use HasFactory;

    protected $connection = 'analytics_conn';

    protected $fillable = [
        'report_type',
        'last_viewed',
     ];
}
