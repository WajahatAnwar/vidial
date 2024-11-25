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
        Schema::connection('purchase_order_conn')->create('p_o_emails', function (Blueprint $table) {
            $table->id();
            $table->boolean('email_status')->nullable();
            $table->string('email_sender_type')->nullable();
            $table->string('title')->nullable();
            $table->string('subject')->nullable();
            $table->string('body')->nullable();
            $table->json('senders_list')->nullable();
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
        Schema::connection('purchase_order_conn')->dropIfExists('p_o_emails');
    }
};
