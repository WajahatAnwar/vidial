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
        Schema::create('inconnect_fraud_statuses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('inconnect_account_id');
            $table->boolean('low')->default(false);
            $table->boolean('medium')->default(false);
            $table->boolean('high')->default(false);
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
        Schema::dropIfExists('inconnect_fraud_statuses');
    }
};
