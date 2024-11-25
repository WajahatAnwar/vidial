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
        Schema::connection('purchase_order_conn')->create('p_o_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('button_text')->nullable();
            $table->string('icon_string')->nullable();
            $table->string('button_placement')->nullable();
            $table->json('font_color')->nullable();
            $table->json('background_color')->nullable();
            $table->string('po_field_placeholder')->nullable();
            $table->string('discount_field_placeholder')->nullable();
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
        Schema::connection('purchase_order_conn')->dropIfExists('p_o_settings');
    }
};
