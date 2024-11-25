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
        //THIS MIGRATION IS GETTING USED FOR 2 OPTIONS. DROPDOWN. IMAGE GRID
        Schema::connection('virtual_options_conn')->create('dropdown_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('option_id');
            $table->string('value');
            $table->boolean('pre_select')->default(false);
            $table->double('upcharge_amount');
            $table->string('image_src')->nullable();
            $table->string('image_name')->nullable();
            $table->string('image_size')->nullable();
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
        Schema::connection('virtual_options_conn')->dropIfExists('dropdown_details');
    }
};
