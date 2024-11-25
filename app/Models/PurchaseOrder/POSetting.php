<?php

namespace App\Models\PurchaseOrder;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class POSetting extends Model
{
    use HasFactory;

    protected $connection = 'purchase_order_conn';

    protected $fillable = [
        'user_id', 'button_text', 'icon_string', 'button_placement', 'font_color', 'background_color', 'po_field_placeholder', 'discount_field_placeholder'
    ];
}
