<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StichingList extends Model
{
    use HasFactory;
    protected $connection = 'in_connect_conn';
    protected $fillable = [
        'title',
        'min',
        'max',
    ];

    public function stichingListDetails(){
        return $this->hasMany(StichingListDetail::class);
    }
}
