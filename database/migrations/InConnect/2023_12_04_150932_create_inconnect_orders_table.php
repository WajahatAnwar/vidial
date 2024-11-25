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
        Schema::create('inconnect_orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('inconnect_account_id')->nullable();
            $table->string('shopify_customer_id')->nullable();
            $table->string('shopify_customer_name')->nullable();
            $table->string('shopify_order_id')->nullable();
            $table->string('shopify_order_no')->nullable();
            $table->string('shopify_order_name')->nullable();
            $table->string('vendor_id')->nullable();
            $table->string('vendor_order_id')->nullable();
            $table->string('vendor_intacct_order_id')->nullable();
            $table->string('decorator_id')->nullable();
            $table->string('decorator_order_id')->nullable();
            $table->string('decorator_intacct_order_id')->nullable();
            $table->boolean('is_vip')->default(false);
            $table->boolean('decorator_intact_sent')->default(false);     //FALSE MEANS NOT SENT TO INTACCT FOR DECORATOR. TRUE MEANS SENT TO INTACCT FOR DECORATOR
            $table->boolean('vendor_intact_sent')->default(false);     //FALSE MEANS NOT SENT TO INTACCT VENDOR. TRUE MEANS SENT TO INTACCT VENDOR
            $table->boolean('decorator_sent')->default(false);     //FALSE MEANS NOT SENT TO DECORATOR. TRUE MEANS SENT TO DECORATOR
            $table->boolean('vendor_sent')->default(false);     //FALSE MEANS NOT SENT TO VENDOR. TRUE MEANS SENT TO VENDOR
            $table->string('fulfillment_status')->nullable();
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
        Schema::dropIfExists('inconnect_orders');
    }
};
