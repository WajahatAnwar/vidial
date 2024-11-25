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
        Schema::create('decorator_personalization_inputs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('decorator_id')->nullable();
            $table->unsignedBigInteger('decorator_data_id')->nullable(); // type = personalization_input
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
        Schema::dropIfExists('decorator_personalization_inputs');
    }
};
