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
        Schema::create('pomw_gateway_clients', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('account_id')->nullable();
            $table->bigInteger('network_id')->nullable();
            $table->bigInteger('type_id')->nullable();
            $table->bigInteger('parser_id')->nullable();
            $table->string('name')->nullable();
            $table->boolean('is_live')->default(false);
            $table->string('uri')->nullable();
            $table->string('domain')->nullable();
            $table->string('invoice_receiver_url')->nullable();
            $table->string('shared_secret')->nullable();
            $table->string('to_identity')->nullable();
            $table->string('to_domain')->nullable();
            $table->string('from_identity')->nullable();
            $table->string('from_domain')->nullable();
            $table->string('global_identity', 255)->nullable();
            $table->string('credentials_password')->nullable();
            $table->boolean('shipping_as_lineitem')->default(false);
            $table->boolean('tax_as_lineitem')->default(false);
            $table->boolean('discount_on_lineitem')->default(false);
            $table->string('notification_emails')->nullable();
            $table->string('cstore_uri')->nullable();
            $table->string('cstore_shared_secret')->nullable();
            $table->boolean('push_invoice_enabled')->default(false);
            $table->string('cxmlbase64_param_override', 255)->nullable();
            $table->uuid('uuid')->nullable();
            $table->string('stock_products_prefix', 255)->nullable();
            $table->string('shopify_shop_url')->nullable();
            $table->string('magento2_store_code', 255)->nullable();
            $table->string('magento2_client_group', 255)->nullable();
            $table->boolean('tax_free')->default(false);
            $table->boolean('override_item_classification')->default(false);
            $table->string('override_item_classification_code', 255)->nullable();
            $table->string('payment_term_days', 255)->nullable();
            $table->boolean('calculate_shipping_taxes_on_incoming_order')->default(false);
            $table->boolean('credit_memo_amounts_must_be_positive')->default(false);
            $table->boolean('credit_memo_quantities_must_be_negative')->default(false);
            $table->integer('internal_order_id_zero_pad_length')->nullable();
            $table->boolean('require_cxml_order_confirmations')->default(false);
            $table->string('cxml_order_confirmations_url')->nullable();
            $table->dateTime('golive_date')->nullable();
            $table->boolean('disable_delivery')->default(false);
            $table->string('overridden_account_identity', 255)->nullable();
            $table->boolean('enable_custom_shipping_provider')->default(false);
            $table->boolean('enable_discount_coupons')->nullable();
            $table->string('ariba_network_identity')->nullable();
            $table->string('ariba_own_identity')->nullable();
            $table->string('custom_invoice_cxml_invoice_partner')->nullable();
            $table->string('ariba_credit_memo_purpose', 255)->nullable();
            $table->string('ariba_default_credit_memo_reason', 255)->nullable();
            $table->string('ariba_deployment_mode', 255)->nullable();
            $table->string('ariba_default_tax_location', 255)->nullable();
            $table->boolean('override_session_credentials')->nullable();
            $table->integer('group_id')->nullable();
            $table->boolean('is_group_roadblock_active')->nullable();
            $table->string('roadblock_icon_uri')->nullable();
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
        Schema::dropIfExists('pomw_gateway_clients');
    }
};
