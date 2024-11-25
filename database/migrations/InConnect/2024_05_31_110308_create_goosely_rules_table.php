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
        Schema::create('goosely_rules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_type_id');
            $table->boolean('shopifyOrder');
            $table->boolean('intacctOrder');
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
        Schema::dropIfExists('goosely_rules');
    }
};
