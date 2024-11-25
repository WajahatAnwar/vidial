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
        Schema::connection('in_connect_conn')->table('inconnect_orders', function (Blueprint $table) {
            $table->string('idex_tracking_company')->nullable()->after('fulfillment_status');
            $table->string('idex_tracking_number')->nullable()->after('idex_tracking_company');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::connection('in_connect_conn')->table('inconnect_orders', function (Blueprint $table) {
            //
        });
    }
};
