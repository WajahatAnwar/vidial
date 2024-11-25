<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PomwCustomQuoteItemType extends Model
{
    use HasFactory;
    protected $connection = 'punchout_conn';
    public function customQuoteItems()
    {
        return $this->hasMany(PomwCustomQuoteItem::class, 'type_id', 'id');
    }
}
