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
        Schema::create('vendor_purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('inconnect_order_id');
            $table->string('po_number')->nullable();
            $table->string('invoice_number')->nullable();
            $table->unsignedBigInteger('vendor_id')->nullable();
            $table->string('intact_po_number')->nullable();
            $table->string('intact_invoice_number')->nullable();
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
        Schema::dropIfExists('vendor_purchase_orders');
    }
};
