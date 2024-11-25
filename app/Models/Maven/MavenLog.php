<?php

namespace App\Models\Maven;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MavenLog extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    protected $fillable = ['json', 'platform'];
}
