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
        Schema::create('punchout_application_statuses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('application_status_id');
            $table->string('type');
            $table->boolean('read_access')->default(false);
            $table->boolean('write_access')->default(false);
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
        Schema::dropIfExists('punchout_application_statuses');
    }
};
