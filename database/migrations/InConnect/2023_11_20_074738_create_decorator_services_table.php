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
        Schema::create('decorator_services', function (Blueprint $table) {
            $table->id();
            $table->string('service_id')->nullable(); // manually add on frontend
            $table->json('option_ids')->nullable(); // manually add on frontend
            $table->unsignedBigInteger('decorator_id')->nullable();
            $table->unsignedBigInteger('decorator_data_id')->nullable(); // type = admin_note
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
        Schema::dropIfExists('decorator_services');
    }
};
