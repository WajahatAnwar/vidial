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
            $table->longText('manual_note')->nullable()->after('intact_sales_invoice_id');
            $table->unsignedBigInteger('manual_user_id')->nullable()->after('manual_note');
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
