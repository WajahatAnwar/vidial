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
        Schema::create('goosely_purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('due_date')->nullable();
            $table->string('vendor_id')->nullable();
            $table->string('reference_no')->nullable();
            $table->string('document_no')->nullable();
            $table->string('intacct_invoice_number')->nullable();
            $table->string('intacct_purchase_order_id')->nullable();
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
        Schema::dropIfExists('goosely_purchase_orders');
    }
};
