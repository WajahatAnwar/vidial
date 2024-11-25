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
        Schema::table('inconnect_accounts', function (Blueprint $table) {
            $table->unsignedBigInteger('intact_department_id')->nullable()->after('intact_customer_id');
            $table->unsignedBigInteger('intact_class_id')->nullable()->after('intact_department_id');
            $table->unsignedBigInteger('intact_payment_term_id')->nullable()->after('intact_class_id');
            $table->unsignedBigInteger('intact_transaction_status_id')->nullable()->after('intact_payment_term_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('inconnect_accounts', function (Blueprint $table) {
            //
        });
    }
};
