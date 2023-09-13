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
        Schema::create('google_drive_creds', function (Blueprint $table) {
            $table->id();
            $table->longText('api_key')->nullable();
            $table->longText('client_id')->nullable();
            $table->longText('secret_key')->nullable();
            $table->longText('folder_name')->nullable();
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
        Schema::dropIfExists('google_drive_creds');
    }
};
