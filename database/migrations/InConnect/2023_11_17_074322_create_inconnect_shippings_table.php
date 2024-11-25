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
        Schema::connection('in_connect_conn')->create('inconnect_shippings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('inconnect_decorator_id');
            $table->unsignedBigInteger('shopify_shipping_field_id');
            $table->string('3p_account_number');
            $table->string('carrier_id')->nullable();
            $table->string('method_id')->nullable();
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
        Schema::connection('in_connect_conn')->dropIfExists('inconnect_shippings');
    }
};
