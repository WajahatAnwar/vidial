<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PomwProcurementStreetAddress extends Model
{
    use HasFactory;

    protected $connection = 'punchout_conn';

    protected $fillable = [
        'account_id',
        'deliver_to',
        'ident',
        'label',
        'line1',
        'line2',
        'city',
        'state',
        'country',
        'zip',
        'uuid',
        'email',
    ];
}
