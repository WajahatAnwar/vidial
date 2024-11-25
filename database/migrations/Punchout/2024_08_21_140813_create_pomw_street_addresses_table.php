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
        Schema::create('pomw_street_addresses', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('customer_session_id')->nullable();
            $table->string('deliver_to')->nullable();
            $table->string('ident')->nullable();
            $table->string('email')->nullable();
            $table->string('line1')->nullable();
            $table->string('line2')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();
            $table->string('label')->nullable();
            $table->string('zip')->nullable();
            $table->string('note')->nullable();
            $table->uuid('uuid')->nullable();
            $table->timestamps(); // includes created_at and updated_at fields
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('pomw_street_addresses');
    }
};
