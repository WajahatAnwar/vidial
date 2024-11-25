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
        Schema::connection('virtual_options_conn')->create('option_assigned_sets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('option_id')->nullable();
            $table->unsignedBigInteger('option_set_id');
            $table->unsignedBigInteger('sort_number')->nullable();
            $table->string('extra')->nullable();
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
        Schema::connection('virtual_options_conn')->dropIfExists('option_assigned_sets');
    }
};
