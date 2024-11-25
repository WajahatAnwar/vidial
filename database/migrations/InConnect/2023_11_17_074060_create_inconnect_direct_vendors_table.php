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
        Schema::connection('in_connect_conn')->create('inconnect_direct_vendors', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('inconnect_account_id');
            $table->unsignedBigInteger('vendor_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::connection('in_connect_conn')->dropIfExists('inconnect_direct_vendors');
    }
};
