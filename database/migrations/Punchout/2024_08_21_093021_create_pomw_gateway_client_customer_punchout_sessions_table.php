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
        Schema::create('pomw_gateway_client_customer_punchout_sessions', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('account_id')->nullable();
            $table->bigInteger('customer_id')->nullable();
            $table->bigInteger('client_id')->nullable();
            $table->string('session_key')->nullable();
            $table->string('type')->nullable();
            $table->string('buyer_cookie')->nullable();
            $table->string('operation')->nullable();
            $table->string('post_url')->nullable();
            $table->string('setup_url')->nullable();
            $table->string('uuid')->nullable();
            $table->string('request_cxml')->nullable();
            $table->boolean('punched_in')->nullable();
            $table->string('raw_request_data')->nullable();
            $table->string('mode')->nullable();
            $table->string('login_token')->nullable();
            $table->string('login_token_signature')->nullable();
            $table->string('uri')->nullable();
            $table->string('header_to_identity')->nullable();
            $table->string('header_to_domain')->nullable();
            $table->string('header_from_identity')->nullable();
            $table->string('header_from_domain')->nullable();
            $table->string('header_sender_domain')->nullable();
            $table->string('header_sender_identity')->nullable();
            $table->string('header_sender_shared_secret')->nullable();
            $table->string('header_sender_user_agent')->nullable();
            $table->string('business_unit')->nullable();
            $table->string('custom_shipper_account_number', 255)->nullable();
            $table->string('custom_shipper_name', 255)->nullable();
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
        Schema::dropIfExists('pomw_gateway_client_customer_punchout_sessions');
    }
};
