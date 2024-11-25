<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    protected $fillable = [
        'address_line_1',
        'address_line_2',
        'city',
        'state',
        'zip_code'
    ];

    public function addressable()
    {
        return $this->morphTo();
    }
}
