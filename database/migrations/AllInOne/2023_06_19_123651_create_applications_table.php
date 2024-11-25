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
        Schema::connection('all_in_one_conn')->create('applications', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('image_link')->default(env('APP_URL') . '/images/ph_front.jpg');
            $table->string('route')->nullable();
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
        Schema::connection('all_in_one_conn')->dropIfExists('applications');
    }
};
