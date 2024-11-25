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
        Schema::connection('virtual_options_conn')->create('conditions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('option_id');
            $table->unsignedBigInteger('dependent_option_id');
            $table->string('value');
            $table->string('condition_type')->default("equals");
            $table->string('condition_gate')->default("or");
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
        Schema::connection('virtual_options_conn')->dropIfExists('conditions');
    }
};
