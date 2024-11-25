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
        Schema::create('filter_set_filters', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('filter_set_id');
            $table->unsignedBigInteger('filter_id');
            $table->unsignedBigInteger('sort_number')->nullable();
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
        Schema::dropIfExists('filter_set_filters');
    }
};
