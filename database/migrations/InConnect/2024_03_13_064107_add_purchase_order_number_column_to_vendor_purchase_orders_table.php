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
        Schema::table('vendor_purchase_orders', function (Blueprint $table) {
            $table->string('purchase_order_no')->nullable()->after('inconnect_order_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('vendor_purchase_orders', function (Blueprint $table) {
            Schema::hasColumn('vendor_purchase_orders', 'purchase_order_no') && $table->dropColumn('purchase_order_no');
        });
    }
};
