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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->unsignedBigInteger('role_id')->default(2);
            $table->string('store_name')->nullable();
            //PO
            $table->boolean('direct_approve')->default(false);
            $table->boolean('show_discount_field')->default(false);
            $table->json('icons_color')->nullable();
            $table->longText('store_emails')->nullable();
            $table->unsignedBigInteger('p_o_shipping_rule_id')->nullable();
            //AIO
            $table->string('order_sync')->nullable();
            $table->string('product_sync')->nullable();
            $table->string('user_picture')->default(env('APP_URL') . '/images/ph_front.jpg');
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
        Schema::dropIfExists('users');
    }
};
