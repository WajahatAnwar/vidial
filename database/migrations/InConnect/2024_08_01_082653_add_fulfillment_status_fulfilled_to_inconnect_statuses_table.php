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
        Schema::table('inconnect_statuses', function (Blueprint $table) {
            $table->boolean('fulfillment_status_fulfilled')->default(false)->after('fulfillment_status_shipped');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('inconnect_statuses', function (Blueprint $table) {
            //
        });
    }
};
