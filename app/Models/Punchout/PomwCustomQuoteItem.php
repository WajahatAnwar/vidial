<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PomwCustomQuoteItem extends Model
{
    use HasFactory;
    protected $connection = 'punchout_conn';
    protected $appends = [
        'type_name',
    ];

    public function customQuote()
    {
        return $this->belongsTo(PomwCustomQuote::class, 'quote_id', 'id');
    }
    public function customQuoteItemType()
    {
        return $this->belongsTo(PomwCustomQuoteItemType::class, 'type_id', 'id');
    }
    public function getTypeNameAttribute()
    {
        return $this->customQuoteItemType->uri;
    }

    public function getTotal()
    {
        if (is_numeric($this->quantity)) {
            $qty = $this->quantity;
        } else {
            $qty = 1;
        }
        return $this->unit_price * $qty;
    }
}
