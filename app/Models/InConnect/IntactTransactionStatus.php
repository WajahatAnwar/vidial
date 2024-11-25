<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IntactTransactionStatus extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    protected $fillable = [
        'transaction_status_id',
        'name',
    ];
}
