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
        Schema::connection('order_splitter_conn')->create('o_s_split_orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('name')->nullable();
            $table->string('shopify_order_id')->nullable();
            $table->string('shopify_customer_id')->nullable();
            $table->string('order_no')->nullable();
            $table->string('billing_address')->nullable();
            $table->string('shipping_address')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('country')->nullable();
            $table->json('line_items')->nullable();
            $table->string('total_price')->nullable();
            $table->boolean('ship_station_status')->default(false);
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
        Schema::connection('order_splitter_conn')->dropIfExists('o_s_split_orders');
    }
};
