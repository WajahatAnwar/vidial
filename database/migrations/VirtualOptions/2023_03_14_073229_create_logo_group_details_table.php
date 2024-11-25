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
        Schema::connection('virtual_options_conn')->create('logo_group_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('option_id');
            $table->unsignedBigInteger('logo_group_id');
            $table->unsignedBigInteger('logo_id');
            $table->double('upcharge_amount');
            $table->boolean('pre_select_status');
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
        Schema::connection('virtual_options_conn')->dropIfExists('logo_group_details');
    }
};
