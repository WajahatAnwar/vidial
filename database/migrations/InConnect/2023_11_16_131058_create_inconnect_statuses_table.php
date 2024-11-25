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
        Schema::connection('in_connect_conn')->create('inconnect_statuses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('inconnect_account_id');
            $table->boolean('order_status_open');
            $table->boolean('order_status_closed');
            $table->boolean('order_status_cancelled');
            $table->boolean('financial_status_authorized');
            $table->boolean('financial_status_pending');
            $table->boolean('financial_status_paid');
            $table->boolean('financial_status_partially_paid');
            $table->boolean('financial_status_refunded');
            $table->boolean('financial_status_voided');
            $table->boolean('financial_status_partially_refunded');
            $table->boolean('financial_status_unpaid');
            $table->boolean('fulfillment_status_unfulfilled');
            $table->boolean('fulfillment_status_unshipped');
            $table->boolean('fulfillment_status_partial');
            $table->boolean('fulfillment_status_shipped');
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
        Schema::connection('in_connect_conn')->dropIfExists('inconnect_statuses');
    }
};
