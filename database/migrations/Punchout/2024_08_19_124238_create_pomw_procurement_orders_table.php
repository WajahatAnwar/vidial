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
        Schema::create('pomw_procurement_orders', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('user_id')->nullable();
            $table->bigInteger('account_id')->nullable();
            $table->bigInteger('catalog_id')->nullable();
            $table->bigInteger('session_id')->nullable();
            $table->bigInteger('internal_id')->nullable();
            $table->bigInteger('approval_id')->nullable();
            $table->decimal('total', 13, 2)->nullable();
            $table->decimal('shipping_total', 13, 2)->nullable();
            $table->decimal('tax_total', 13, 2)->nullable();
            $table->uuid('uuid')->nullable();
            $table->boolean('delivered')->nullable();
            $table->string('remote_ip')->nullable();
            $table->string('shipping_method')->nullable();
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
        Schema::dropIfExists('pomw_procurement_orders');
    }
};
