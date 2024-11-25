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
        Schema::connection('all_in_one_conn')->create('external_decorations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('external_location_id');
            $table->unsignedBigInteger('decoration_id');
            $table->string('decoration_name');
            $table->boolean('decoration_default')->default(false);
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
        Schema::connection('all_in_one_conn')->dropIfExists('external_decorations');
    }
};
