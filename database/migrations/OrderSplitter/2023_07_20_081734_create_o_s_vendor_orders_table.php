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
        Schema::connection('order_splitter_conn')->create('o_s_vendor_orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->bigInteger('order_id');
            $table->bigInteger('shipstation_order_id')->nullable();
            $table->string('order_no')->nullable();
            $table->bigInteger('shopify_customer_id');
            $table->unsignedBigInteger('split_order_id')->nullable();
            $table->bigInteger('vendor_id')->nullable();
            $table->string('vendor_name')->nullable();
            $table->longText('order_items')->nullable();
            $table->longText('product_names')->nullable();
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
        Schema::connection('order_splitter_conn')->dropIfExists('o_s_vendor_orders');
    }
};
