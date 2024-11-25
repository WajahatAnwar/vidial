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
        Schema::connection('virtual_options_conn')->create('file_upload_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('option_id');
            $table->string('instructions');
            $table->unsignedBigInteger('upload_size');
            $table->longText('extensions');
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
        Schema::connection('virtual_options_conn')->dropIfExists('file_upload_details');
    }
};
