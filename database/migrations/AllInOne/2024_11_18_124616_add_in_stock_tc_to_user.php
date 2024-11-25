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
        Schema::table('users', function (Blueprint $table) {
            $table->string('in_stock_text_color')->default('{"red":0,"green":0,"blue":0,"alpha":1}')->after('user_picture');
            $table->string('on_sale_text_color')->default('{"red":255,"green":255,"blue":255,"alpha":1}')->after('user_picture');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('in_stock_text_color');
            $table->dropColumn('on_sale_text_color');
        });
    }
};
