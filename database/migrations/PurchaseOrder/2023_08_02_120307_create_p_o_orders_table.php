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
        Schema::connection('purchase_order_conn')->create('p_o_orders', function (Blueprint $table) {
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
            $table->string('purchase_order_id');
            $table->string('total_price')->nullable();
            $table->boolean('purchase_status')->default(false);
            $table->longText('order_request')->nullable();
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
        Schema::connection('purchase_order_conn')->dropIfExists('p_o_orders');
    }
};
