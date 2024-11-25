<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccountFile extends Model
{
    use HasFactory;
    protected $connection = 'punchout_conn';
}
