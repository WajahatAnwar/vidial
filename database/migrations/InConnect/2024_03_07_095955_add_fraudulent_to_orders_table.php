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
        Schema::table('inconnect_orders', function (Blueprint $table) {
            $table->string('fraud_status')->default('NO_FRAUD')->after('fulfillment_status');   // NO_FRAUD, FRAUD, APPROVED, DECLINED
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('inconnect_orders', function (Blueprint $table) {
            //
        });
    }
};
