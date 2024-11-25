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
        Schema::create('pomw_gateway_client_requests', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('client_id')->nullable()->index();
            $table->bigInteger('customer_session_id')->nullable()->index();
            $table->bigInteger('network_transaction_id')->nullable()->index();
            $table->string('type')->nullable();
            $table->string('operation')->nullable();
            $table->uuid('uuid')->nullable();
            $table->string('payload_ident')->nullable();
            $table->string('data_headers')->nullable();
            $table->string('uri')->nullable();
            $table->string('user_agent')->nullable();
            $table->string('remote_host')->nullable();
            $table->longText('request_data')->nullable();
            $table->longText('decoded_request_data')->nullable();
            $table->longText('response_body')->nullable();
            $table->string('response_code')->nullable();
            $table->string('response_headers')->nullable();
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
        Schema::dropIfExists('pomw_gateway_client_requests');
    }
};
