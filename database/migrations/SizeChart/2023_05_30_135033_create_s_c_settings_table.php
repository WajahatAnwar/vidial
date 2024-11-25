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
        Schema::connection('size_chart_conn')->create('s_c_settings', function (Blueprint $table) {
            $table->id();
            $table->string('button_text');
            $table->string('button_background')->nullable();
            $table->string('button_text_color')->nullable();
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
        Schema::connection('size_chart_conn')->dropIfExists('s_c_settings');
    }
};
