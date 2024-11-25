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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('cancelled_at')->nullable()->after('customer_id');
            $table->string('cancel_reason')->nullable()->after('cancelled_at');
            $table->boolean('is_fraud')->default(false)->after('cancel_reason');
            $table->boolean('on_hold')->default(false)->after('is_fraud');
            $table->unsignedBigInteger('restriction_id')->nullable()->after('on_hold');
            $table->json('payload')->nullable()->after('restriction_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            //
        });
    }
};
