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
        Schema::connection('virtual_options_conn')->create('logos', function (Blueprint $table) {
            $table->id();
            $table->string("code_name")->unique();
            $table->string("color_hash");
            $table->string("logo_image_link")->default(env('APP_URL') . '/images/ph_front.jpg');
            $table->longText("tags")->nullable();
            $table->string("stitch_count")->nullable();
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
        Schema::connection('virtual_options_conn')->dropIfExists('logos');
    }
};
