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
        Schema::table('batch_settings', function (Blueprint $table) {
            $table->integer('days_count')->nullable()->after('batch_day');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('batch_settings', function (Blueprint $table) {
            $table->dropColumn('days_count');
        });
    }
};
