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
        Schema::create('decorator_data', function (Blueprint $table) {
            $table->id();
            $table->string('type')->nullable(); // admin_note, dropdown, frontend_name, logo_group
            $table->string('name')->nullable();
            $table->unsignedBigInteger('count')->default(0);
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
        Schema::dropIfExists('decorator_data');
    }
};
