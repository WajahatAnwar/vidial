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
        Schema::connection('all_in_one_conn')->create('external_charges', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('external_decoration_id');
            $table->unsignedBigInteger('charge_id');
            $table->string('charge_name');
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
        Schema::connection('all_in_one_conn')->dropIfExists('external_charges');
    }
};
