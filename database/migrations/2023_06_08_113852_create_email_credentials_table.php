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
        Schema::create('email_credentials', function (Blueprint $table) {
            $table->id();
            $table->string('mail_user_name');
            $table->string('api_secret_key');
            $table->string('endpoint');
            $table->string('domain');
            $table->integer('is_active');
            $table->unsignedBigInteger('user_id');
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
        Schema::dropIfExists('email_credentials');
    }
};
