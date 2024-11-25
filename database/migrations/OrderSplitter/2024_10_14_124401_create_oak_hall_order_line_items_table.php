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
        Schema::create('oak_hall_order_line_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('oak_hall_order_id');

            // Line item details
            $table->string('line_number')->nullable();
            $table->string('description')->nullable();
            $table->string('product_id')->nullable();
            $table->integer('quantity')->default(0);
            $table->decimal('book_store_cost', 10, 2)->default(0.00);
            $table->string('vendor_item_no')->nullable();
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
        Schema::dropIfExists('oak_hall_order_line_items');
    }
};
