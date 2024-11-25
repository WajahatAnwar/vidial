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
        Schema::create('batch_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('batch_id');
            $table->unsignedBigInteger('inconnect_order_id');
            $table->string('sku');
            $table->string('quantity');
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
        Schema::dropIfExists('batch_items');
    }
};
