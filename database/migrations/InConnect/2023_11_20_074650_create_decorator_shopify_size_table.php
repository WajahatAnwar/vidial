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
        Schema::create('decorator_shopify_size', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('decorator_size_id')->nullable();
            $table->unsignedBigInteger('shopify_size_id')->nullable();
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
        Schema::dropIfExists('decorator_shopify_size');
    }
};
