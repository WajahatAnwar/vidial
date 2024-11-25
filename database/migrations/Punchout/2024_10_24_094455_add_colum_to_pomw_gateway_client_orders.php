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
        Schema::connection('punchout_conn')->table('pomw_gateway_client_orders', function (Blueprint $table) {
            //
            $table->string('shopify_order_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('pomw_gateway_client_orders', function (Blueprint $table) {
            //
        });
    }
};
