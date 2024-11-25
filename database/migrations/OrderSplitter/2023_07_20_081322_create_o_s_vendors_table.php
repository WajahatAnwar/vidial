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
        Schema::connection('order_splitter_conn')->create('o_s_vendors', function (Blueprint $table) {
            $table->id();
            $table->string('vendor_name');
            $table->longText('vendor_private_key')->nullable();
            $table->longText('vendor_secret_key')->nullable();
            $table->longText('vendor_store_id')->nullable();
            $table->longText('vendor_warehouse_id')->nullable();
            $table->longText('type')->nullable();
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
        Schema::connection('order_splitter_conn')->dropIfExists('o_s_vendors');
    }
};
