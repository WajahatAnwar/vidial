<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('batches', function (Blueprint $table) {
            $table->string('purchase_order_no')->nullable()->after('batch_status');
            $table->string('po_number')->nullable()->after('purchase_order_no');
            $table->string('intacct_po_number')->nullable()->after('po_number');
            $table->string('invoice_number')->nullable()->after('intacct_po_number');
            $table->string('intacct_invoice_number')->nullable()->after('invoice_number');
            $table->longText('intacct_payload')->nullable()->after('intacct_invoice_number');
            $table->string('tracking_number')->nullable()->after('intacct_payload');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('batches', function (Blueprint $table) {
            //
        });
    }
};
