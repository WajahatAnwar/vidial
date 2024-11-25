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
        Schema::create('inconnect_order_emails', function (Blueprint $table) {
            $table->id();
            $table->json('email_data')->nullable();
            $table->boolean('is_sent')->default(false);
            $table->unsignedBigInteger('inconnect_order_id');
            $table->unsignedBigInteger('email_template_id');
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
        Schema::dropIfExists('inconnect_order_emails');
    }
};
