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
            $table->boolean('old_tax_true')->default(false)->after('second_si_id');
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
