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
        Schema::create('decorator_locations', function (Blueprint $table) {
            $table->id();
            $table->string('location_id')->nullable();
            $table->unsignedBigInteger('decorator_data_id')->nullable(); // type = dropdown
            $table->unsignedBigInteger('decorator_id')->nullable();
            $table->unsignedBigInteger('decorator_service_id')->nullable();
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
        Schema::dropIfExists('decorator_service_locations');
    }
};
