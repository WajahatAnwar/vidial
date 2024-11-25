<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StichingListDetail extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    protected $fillable = [
      'from',
      'to',
      'price',
      'stiching_list_id'
    ];
}
