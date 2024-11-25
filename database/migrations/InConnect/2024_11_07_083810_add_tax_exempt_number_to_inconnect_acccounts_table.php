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
        Schema::table('inconnect_accounts', function (Blueprint $table) {
            $table->string('tax_exempt_number')->nullable()->after('shipping_method');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('inconnect_accounts', function (Blueprint $table) {
            //
        });
    }
};
