<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemMessage extends Model
{
    use HasFactory;
    protected $connection = 'punchout_conn';
}
