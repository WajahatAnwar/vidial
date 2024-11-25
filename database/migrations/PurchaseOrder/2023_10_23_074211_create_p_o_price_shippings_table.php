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
        Schema::connection('purchase_order_conn')->create('p_o_price_shippings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("min");
            $table->unsignedBigInteger("max");
            $table->decimal("shipping_price", 8, 2);
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
        Schema::connection('purchase_order_conn')->dropIfExists('p_o_price_shippings');
    }
};
