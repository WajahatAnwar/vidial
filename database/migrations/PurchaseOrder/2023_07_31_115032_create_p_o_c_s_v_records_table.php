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
        Schema::connection('purchase_order_conn')->create('p_o_c_s_v_records', function (Blueprint $table) {
            $table->id();
            $table->string('handle_name');
            $table->unsignedBigInteger('min_quantity');
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
        Schema::connection('purchase_order_conn')->dropIfExists('p_o_c_s_v_records');
    }
};
