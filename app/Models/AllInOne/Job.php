<?php

namespace App\Models\AllInOne;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    use HasFactory;

    protected $connection = 'all_in_one_conn';
}
