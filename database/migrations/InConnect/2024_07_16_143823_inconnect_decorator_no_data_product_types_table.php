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
        Schema::create('inconnect_decorator_no_data_product_types', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('inconnect_decorator_id');
            $table->unsignedBigInteger('product_type_id');
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
        Schema::dropIfExists('inconnect_decorator_no_data_product_types');
    }
};
