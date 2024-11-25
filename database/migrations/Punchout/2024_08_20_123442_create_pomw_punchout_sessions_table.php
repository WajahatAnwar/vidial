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
        Schema::create('pomw_punchout_sessions', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('user_id')->nullable();
            $table->bigInteger('catalog_id')->nullable();
            $table->bigInteger('address_id')->nullable();
            $table->string('token')->nullable();
            $table->boolean('cancelled')->default(false);
            $table->boolean('completed')->nullable();
            $table->string('buyer_cookie')->nullable();
            $table->uuid('uuid')->nullable();
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
        Schema::dropIfExists('pomw_punchout_sessions');
    }
};
