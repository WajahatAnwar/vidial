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
        Schema::create('pomw_catalogs', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('account_id')->nullable();
            $table->bigInteger('type_id')->nullable();
            $table->bigInteger('network_id')->nullable();
            $table->string('name')->nullable();
            $table->string('domain')->nullable();
            $table->uuid('uuid')->nullable();
            $table->string('shared_secret')->nullable();
            $table->string('punchout_url')->nullable();
            $table->string('order_transfer_url')->nullable();
            $table->string('profile_url')->nullable();
            $table->string('production_punchout_url')->nullable();
            $table->string('production_order_transfer_url')->nullable();
            $table->string('production_profile_url')->nullable();
            $table->string('uri')->nullable();
            $table->string('to_domain')->nullable();
            $table->string('to_identity')->nullable();
            $table->string('from_domain')->nullable();
            $table->string('from_identity')->nullable();
            $table->boolean('opens_in_new_window')->nullable();
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
        Schema::dropIfExists('pomw_catalogs');
    }
};
