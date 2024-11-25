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
        Schema::connection('virtual_options_conn')->create('thread_color_families', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('input_field_thread_id');
            $table->unsignedBigInteger('family_id');
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
        Schema::connection('virtual_options_conn')->dropIfExists('thread_color_families');
    }
};
