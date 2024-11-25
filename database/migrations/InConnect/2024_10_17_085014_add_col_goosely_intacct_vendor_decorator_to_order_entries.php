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
        //DATE WHEN THESE COLUMNS ADDED 2024-10-17 09:17:49	
        Schema::table('order_entries', function (Blueprint $table) {
            $table->boolean('gooselyStatus')->nullable()->after('inconnect_order_id');
            $table->boolean('intacctStatus')->nullable()->after('gooselyStatus');
            $table->boolean('vendorStatus')->nullable()->after('intacctStatus');
            $table->boolean('decoratorStatus')->nullable()->after('vendorStatus');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('order_entries', function (Blueprint $table) {
            //
        });
    }
};
