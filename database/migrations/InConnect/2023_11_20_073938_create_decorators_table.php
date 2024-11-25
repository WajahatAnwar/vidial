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
        Schema::create('decorators', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('po_prefix')->nullable();
            $table->string('so_prefix')->nullable();
            $table->unsignedBigInteger('intact_vendor_id')->nullable();
            $table->string('notes')->nullable();
            $table->string('username')->nullable();
            $table->string('password')->nullable();
            $table->string('client_id')->nullable();
            $table->string('client_secret')->nullable();
            $table->string('intact_location_id')->nullable();
            $table->string('intact_department_id')->nullable();
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
        Schema::dropIfExists('decorators');
    }
};
