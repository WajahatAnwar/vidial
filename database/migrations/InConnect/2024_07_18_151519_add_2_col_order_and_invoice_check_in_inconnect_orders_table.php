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
        Schema::table('inconnect_orders', function (Blueprint $table) {
            $table->boolean('sales_order_check')->default(false)->after('intact_sales_invoice_id');
            $table->boolean('sales_invoice_check')->default(false)->after('sales_order_check');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('inconnect_orders', function (Blueprint $table) {
            //
        });
    }
};
