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
        Schema::table('settings', function (Blueprint $table) {
            $table->string('instruction_title_font')->nullable()->after('instructions');
            $table->string('instruction_count')->nullable()->after('instructions');
            $table->string('instruction_button_style')->nullable()->after('instructions');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn('instruction_title_font');
            $table->dropColumn('instruction_count');
            $table->dropColumn('instruction_button_style');
        });
    }
};
