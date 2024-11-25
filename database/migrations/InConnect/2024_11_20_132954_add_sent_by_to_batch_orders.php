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
        Schema::table('batch_orders', function (Blueprint $table) {
            $table->string('sent_by')->nullable()->after('inconnect_order_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('batch_orders', function (Blueprint $table) {
            $table->dropColumn('sent_by');
        });
    }
};
