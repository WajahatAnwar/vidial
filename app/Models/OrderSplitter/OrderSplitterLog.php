<?php

namespace App\Models\OrderSplitter;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class OrderSplitterLog extends Model
{
    use HasFactory;

    protected $connection = 'order_splitter_conn';

    protected $fillable = [
        'type',
        'user_id',
        'description',
        'o_s_split_order_id'
    ];

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->table = DB::connection('order_splitter_conn')->getDatabaseName() . '.order_splitter_logs';
    }

    public function user()
    {
        return $this->belongsTo('App\Models\AllInOne\User');
    }

    public function order()
    {
        return $this->belongsTo('App\Models\OrderSplitter\OSSplitOrder', 'o_s_split_order_id');
    }
}
