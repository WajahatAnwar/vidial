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
        Schema::create('restriction_collections', function (Blueprint $table) {
            $table->id();
            $table->string('handle')->nullable();
            $table->string('title')->nullable();
            $table->unsignedBigInteger('restriction_id');
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
        Schema::dropIfExists('restriction_collections');
    }
};
