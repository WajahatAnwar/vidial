<?php

namespace App\Models\Punchout;

use App\Models\AllInOne\User;
use App\Models\Punchout\PomwGatewayClientCustomer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PomwGatewayClient extends Model
{
    use HasFactory;

    protected $connection = 'punchout_conn';

    protected $fillable = [
        'account_id',
        'network_id',
        'type_id',
        'parser_id',
        'name',
        'is_live',
        'uri',
        'domain',
        'invoice_receiver_url',
        'shared_secret',
        'to_identity',
        'to_domain',
        'from_identity',
        'from_domain',
        'global_identity',
        'credentials_password',
        'shipping_as_lineitem',
        'tax_as_lineitem',
        'discount_on_lineitem',
        'notification_emails',
        'cstore_uri',
        'cstore_shared_secret',
        'push_invoice_enabled',
        'cxmlbase64_param_override',
        'uuid',
        'stock_products_prefix',
        'shopify_shop_url',
        'magento2_store_code',
        'magento2_client_group',
        'tax_free',
        'override_item_classification',
        'override_item_classification_code',
        'payment_term_days',
        'calculate_shipping_taxes_on_incoming_order',
        'credit_memo_amounts_must_be_positive',
        'credit_memo_quantities_must_be_negative',
        'internal_order_id_zero_pad_length',
        'require_cxml_order_confirmations',
        'cxml_order_confirmations_url',
        'golive_date',
        'disable_delivery',
        'overridden_account_identity',
        'enable_custom_shipping_provider',
        'enable_discount_coupons',
        'ariba_network_identity',
        'ariba_own_identity',
        'custom_invoice_cxml_invoice_partner',
        'ariba_credit_memo_purpose',
        'ariba_default_credit_memo_reason',
        'ariba_deployment_mode',
        'ariba_default_tax_location',
        'override_session_credentials',
        'group_id',
        'is_group_roadblock_active',
        'roadblock_icon_uri',
    ];

    protected $appends = [
        'network_name',
        'type_name'
    ];

    public function pomw_client_customers()
    {
        return $this->hasMany(PomwGatewayClientCustomer::class, 'client_id', 'id');
    }

    public function pomw_client_sessions()
    {
        return $this->hasMany(PomwGatewayClientCustomerPunchoutSession::class, 'client_id', 'id');
    }

    public function pomw_client_network()
    {
        return $this->belongsTo(PomwProcurementNetwork::class, 'network_id', 'id');
    }

    public function pomw_client_orders()
    {
        return $this->hasMany(PomwGatewayClientOrder::class, 'client_id', 'id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'uuid', 'uuid');
    }

    public function shouldShippingBeLineItem()
    {
        return ($this->getAttribute('shipping_as_lineitem') == 1);
    }

    public function shouldTaxBeLineItem()
    {
        return ($this->getAttribute('tax_as_lineitem') == 1);
    }

    public function shouldDiscountBeOnLineItem()
    {
        return ($this->getAttribute('discount_on_lineitem') == 1);
    }

    public function shouldOverrideItemClassificationCode()
    {
        return ($this->getAttribute('override_item_classification') == 1);
    }

    public function shouldCalculateShippingAndTaxesOnIncomingOrder()
    {
        return ($this->getAttribute('calculate_shipping_taxes_on_incoming_order') === 1);
    }

    public function shouldEnableCustomShippingProvider()
    {
        return $this->getAttribute('enable_custom_shipping_provider') === 1;
    }

    public function areDiscountCodesEnabled()
    {
        return ($this->getAttribute('enable_discount_coupons') === 1);
    }

    public function getNextInternalOrderIdAttribute()
    {
        $total_pomw_orders = $this->pomw_client_orders()->count();
        $total_pomw_orders = str_pad($total_pomw_orders, $this->internal_order_id_zero_pad_length ? $this->internal_order_id_zero_pad_length : 8, '0', STR_PAD_LEFT);
        return $this->getAttribute('id') . $total_pomw_orders;
    }

    public function pomw_client_type()
    {
        return $this->belongsTo(PomwGatewayClientTypes::class, 'type_id', 'id');
    }
    public function getNetworkNameAttribute()
    {
        return $this->pomw_client_network?->name;
    }
    public function getTypeNameAttribute()
    {
        return $this->pomw_client_type?->name;
    }
    public function discountCodes(){
        return $this->hasMany(PomwGatewayClientDiscountCode::class, 'client_id', 'id');
    }
    public function productQuantityLimits(){
        return $this->hasMany(PomwGatewayClientProductQuantityLimit::class, 'client_id', 'id');
    }
    public function shouldOverrideSessionCredentials()
    {
        return $this->override_session_credentials === 1;
    }
    public function getMasterAccountIdentity()
    {
        if (!empty($this->overriden_account_identity))
        {
            return $this->overriden_account_identity;
        }

        return $this->account->master_identity;
    }
    public function account(){
        return $this->belongsTo(Account::class, 'account_id', 'id');
    }
    public function shouldCreditMemoItemQuantitiesBeNegative()
    {
        return $this->credit_memo_quantities_must_be_negative === 1;
    }
    public function shouldCreditMemoAmountsBeNegative()
    {
        return !$this->shouldCreditMemoAmountsBePositive();
    }
    public function shouldCreditMemoAmountsBePositive()
    {
        return $this->credit_memo_amounts_must_be_positive === 1;
    }
    public function isTaxFree()
    {
        return $this->tax_free === 1;
    }
    public function isInvoicePushEnabled()
    {
        return $this->push_invoice_enabled === 1;
    }

    public function getPunchoutStartUrl()
    {
        return route('punchout.gateway.punchout', $this->uuid);
    }

    public function getOrderRequestUrl()
    {
        return route('punchout.gateway.order.request', $this->uuid);
    }
    public function getInvoiceReceiverUrl(){
        return !empty($this->invoice_receiver_url) ? $this->invoice_receiver_url : "N/A";
    }
}
