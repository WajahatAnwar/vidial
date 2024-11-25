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
        Schema::connection('virtual_options_conn')->create('input_field_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('option_id');
            $table->string('line_no');
            $table->boolean('required');
            $table->unsignedBigInteger('max_char');
            $table->double('upcharge_amount');
            $table->string('font_json');
            $table->double('font_size');
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
        Schema::connection('virtual_options_conn')->dropIfExists('input_field_details');
    }
};
