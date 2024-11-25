<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PomwProcurementOrderTransferStatus extends Model
{
    use HasFactory;

    protected $table = 'pomw_procurement_order_transfer_status';
    protected $connection = 'punchout_conn';
}
