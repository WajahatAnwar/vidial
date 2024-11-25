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
        Schema::connection('in_connect_conn')->create('inconnect_accounts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('store_type_id');
            $table->boolean('status');
            $table->boolean('intact_sync')->default(false);
            $table->boolean('decorator_sync')->default(false);
            $table->boolean('vendor_sync')->default(false);
            $table->unsignedBigInteger('intact_account_id')->nullable();
            $table->unsignedBigInteger('intact_customer_id')->nullable();
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
        Schema::connection('in_connect_conn')->dropIfExists('inconnect_accounts');
    }
};
