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
        Schema::create('goosely_purchase_order_line_items', function (Blueprint $table) {
            $table->id();
            $table->string('item_id')->nullable();
            $table->unsignedBigInteger('goosely_purchase_order_id')->nullable();
            $table->string('quantity')->nullable();
            $table->string('price')->nullable();
            $table->string('location_id')->nullable();
            $table->string('department_id')->nullable();
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
        Schema::dropIfExists('goosely_purchase_order_line_items');
    }
};
