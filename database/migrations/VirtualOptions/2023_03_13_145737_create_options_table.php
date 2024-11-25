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
        Schema::connection('virtual_options_conn')->create('options', function (Blueprint $table) {
            $table->id();
            $table->string('option_name');
            $table->string('frontend_name');
            $table->boolean('required');
            $table->unsignedBigInteger('option_type_id');
            $table->boolean('conditions_status');
            // $table->longText('conditions_json')->nullable();
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
        Schema::connection('virtual_options_conn')->dropIfExists('options');
    }
};
