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
        Schema::create('oak_hall_orders', function (Blueprint $table) {
            $table->id();
            $table->string('external_order_id')->nullable();
            $table->string('shipstation_order_id')->nullable();
            $table->string('order_status')->nullable();
            $table->string('comment')->nullable();
            $table->string('customer_name')->nullable();
            $table->string('customer_email')->nullable();
            $table->string('customer_phone_no')->nullable();
            $table->string('street')->nullable();
            $table->string('street_details')->nullable();
            $table->string('zip_code')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country_code')->nullable();
            $table->string('shipment_status')->nullable();
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
        Schema::dropIfExists('oak_hall_orders');
    }
};
