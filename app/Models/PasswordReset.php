<?php

namespace App\Models\AllInOne;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PasswordReset extends Model
{
    use HasFactory;

    protected $connection = 'all_in_one_conn';

    protected $primaryKey = 'email';

    public $incrementing = false;

    protected $fillable = [
        'email',
        'token'
    ];
}
