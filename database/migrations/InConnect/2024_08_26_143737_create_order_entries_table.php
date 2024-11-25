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
        Schema::create('order_entries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('inconnect_order_id')->nullable();
            $table->string('order_name')->nullable();
            $table->unsignedBigInteger('ordersCreateJob')->nullable();
            $table->unsignedBigInteger('realOrdersCreateJob')->nullable();
            $table->unsignedBigInteger('orderCreateJob')->nullable();
            $table->unsignedBigInteger('intacctSalesOrderJobSales')->nullable();
            $table->unsignedBigInteger('vendorOrderJob')->nullable();
            $table->unsignedBigInteger('intacctOrderCreateJobVendor')->nullable();
            $table->unsignedBigInteger('decideDecorator')->nullable();
            $table->unsignedBigInteger('idexOrderJob')->nullable();
            $table->unsignedBigInteger('screenProJob')->nullable();
            $table->unsignedBigInteger('intacctOrderCreateJobDecorator')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('order_entries');
    }
};
