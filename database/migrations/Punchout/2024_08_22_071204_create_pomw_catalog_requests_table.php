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
        Schema::create('pomw_catalog_requests', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('catalog_id')->nullable();
            $table->bigInteger('user_id')->nullable();
            $table->bigInteger('network_transaction_id')->nullable();
            $table->string('type')->nullable();
            $table->string('operation')->nullable();
            $table->uuid('uuid')->nullable();
            $table->string('payload_ident')->nullable();
            $table->string('data_headers')->nullable();
            $table->string('uri')->nullable();
            $table->string('user_agent')->nullable();
            $table->string('remote_host')->nullable();
            $table->string('request_data')->nullable();
            $table->string('decoded_request_data')->nullable();
            $table->string('response_body')->nullable();
            $table->string('error')->nullable();
            $table->timestamps(); // includes created_at and updated_at fields
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('pomw_catalog_requests');
    }
};
