<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->boolean(column: 'status')->default(true)->nullable()->after('price');
            $table->boolean(column: 'klaviyo_access')->default(false)->nullable()->after('status');
            $table->string('description_1')->nullable()->after('description');
            $table->string('description_2')->nullable()->after('description_1');
            $table->string('description_3')->nullable()->after('description_2');
            $table->string('description_4')->nullable()->after('description_3');


        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('plans', function (Blueprint $table) {
            //
        });
    }
};
