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
        Schema::table('inconnect_order_updates', function (Blueprint $table) {
            $table->boolean('manual_complete')->nullable()->after('retry');
            $table->longText('manual_log')->nullable()->after('manual_complete');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('inconnect_order_updates', function (Blueprint $table) {
            //
        });
    }
};
