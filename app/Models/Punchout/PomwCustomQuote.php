<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PomwCustomQuote extends Model
{
    use HasFactory;
    protected $connection = 'punchout_conn';
    protected $appends = [
        'total_price',
    ];

    public function customQuoteItems()
    {
        return $this->hasMany(PomwCustomQuoteItem::class, 'quote_id', 'id');
    }
    public function getTotalPriceAttribute()
    {
        return $this->customQuoteItems->sum(function ($item) {
            return $item->unit_price * $item->quantity;
        });
    }
    public function getTotal()
    {
        $total = 0;

        $items = $this->customQuoteItems;
        if (empty($items)) {
            return $total;
        }

        foreach ($items as $item) {
            $total += $item->getTotal();
        }

        return $total;
    }
}
