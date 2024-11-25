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
        Schema::connection('size_chart_conn')->create('s_c_size_charts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->longText('top_text')->nullable();
            $table->longText('chart_data');
            $table->longText('bottom_text')->nullable();
            $table->tinyInteger('status', false, true)->default(0);
            $table->unsignedBigInteger('rule_id');
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
        Schema::connection('size_chart_conn')->dropIfExists('s_c_size_charts');
    }
};
