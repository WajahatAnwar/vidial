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
        Schema::connection('in_connect_conn')->table('inconnect_order_updates', function (Blueprint $table) {
            $table->string('inconnect_order_status_id')->change();
            $table->renameColumn('inconnect_order_status_id', 'name');
            $table->unsignedBigInteger('depends_on')->nullable()->after('failed_at');
            $table->string('type')->nullable()->after('depends_on');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('inconnect_order_updates', function (Blueprint $table) {
            //
        });
    }
};
