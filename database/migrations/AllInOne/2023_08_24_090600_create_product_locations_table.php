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
        Schema::connection('all_in_one_conn')->create('product_locations', function (Blueprint $table) {
            $table->id();
            $table->string('product_handle');
            $table->unsignedBigInteger('external_location_id');
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
        Schema::connection('all_in_one_conn')->dropIfExists('product_locations');
    }
};
