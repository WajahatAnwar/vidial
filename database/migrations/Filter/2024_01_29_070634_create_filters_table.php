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
        Schema::create('filters', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('frontend_name');
            $table->unsignedBigInteger('filter_type_id');
            $table->unsignedBigInteger('default_state_id');
            $table->boolean('multi_select');
            $table->unsignedBigInteger('sort_type_id');
            $table->boolean('show_swatches')->default(false);
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
        Schema::dropIfExists('filters');
    }
};
