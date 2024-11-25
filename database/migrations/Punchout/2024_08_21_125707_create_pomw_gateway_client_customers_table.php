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
        Schema::create('pomw_gateway_client_customers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('client_id')->nullable();
            $table->unsignedBigInteger('account_id')->nullable();
            $table->string('name')->nullable();
            $table->string('firstname')->nullable();
            $table->string('lastname')->nullable();
            $table->string('username')->nullable();
            $table->string('uniquename')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->uuid('uuid')->nullable();
            $table->timestamps(); // for 'created_at' and 'updated_at'
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('pomw_gateway_client_customers');
    }
};
