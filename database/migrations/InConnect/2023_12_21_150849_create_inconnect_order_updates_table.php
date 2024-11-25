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
        Schema::create('inconnect_order_updates', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('inconnect_order_id');
            $table->unsignedBigInteger('inconnect_order_status_id');
            $table->dateTime('initiated_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->unsignedBigInteger('tries')->default(0);
            $table->boolean('retry')->default(false);
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
        Schema::dropIfExists('inconnect_order_updates');
    }
};
