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
        Schema::create('inconnect_order_vendor_prices', function (Blueprint $table) {
            $table->id();
            $table->string('product_id')->nullable();
            $table->string('part_id')->nullable();
            $table->string('fob_id')->nullable();
            $table->string('fob_state')->nullable();
            $table->decimal('price', 12, 2)->default(0);
            $table->string('price_type')->nullable();
            $table->unsignedBigInteger('inconnect_order_id');
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
        Schema::dropIfExists('inconnect_order_vendor_prices');
    }
};
