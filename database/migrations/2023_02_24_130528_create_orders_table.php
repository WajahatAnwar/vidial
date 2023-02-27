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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('order_id')->nullable();
            $table->string('email')->nullable();
            $table->string('contect_email')->nullable();
            $table->string('phone_no')->nullable();
            $table->string('confirmed')->nullable();
            $table->string('order_created_at')->nullable();
            // $table->string('remaining_emails')->nullable();
            $table->string('email_send')->nullable()->default('0');
            $table->string('email_send_at')->nullable();
            $table->string('remaining_mail')->nullable();
            $table->string('replied')->nullable()->default('0');
            $table->string('reminder_mail')->nullable();
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
        Schema::dropIfExists('orders');
    }
};
