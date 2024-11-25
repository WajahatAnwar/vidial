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
            $table->boolean('process')->nullable()->after('sales_invoice_check'); //PROCESSED //INTIAL //PROCESSED AGAIN //ALREADY_CONVERTED
            $table->string('second_so_id')->nullable()->after('process');
            $table->string('second_si_id')->nullable()->after('second_so_id');
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
