<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShopifyOrderFieldsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::connection('in_connect_conn')->table('shopify_order_fields')->insert([
            ['id' => 1, 'name' => 'id'],
            ['id' => 2, 'name' => 'admin_graphql_api_id'],
            ['id' => 3, 'name' => 'app_id'],
            ['id' => 4, 'name' => 'browser_ip'],
            ['id' => 5, 'name' => 'buyer_accepts_marketing'],
            ['id' => 6, 'name' => 'cancel_reason'],
            ['id' => 7, 'name' => 'cancelled_at'],
            ['id' => 8, 'name' => 'cart_token'],
            ['id' => 9, 'name' => 'checkout_id'],
            ['id' => 10, 'name' => 'checkout_token'],
            ['id' => 11, 'name' => 'client_details'],
            ['id' => 12, 'name' => 'closed_at'],
            ['id' => 13, 'name' => 'confirmation_number'],
            ['id' => 14, 'name' => 'confirmed'],
            ['id' => 15, 'name' => 'contact_email'],
            ['id' => 16, 'name' => 'created_at'],
            ['id' => 17, 'name' => 'currency'],
            ['id' => 18, 'name' => 'current_subtotal_price'],
            ['id' => 19, 'name' => 'current_subtotal_price_set'],
            ['id' => 20, 'name' => 'current_total_additional_fees_set'],
            ['id' => 21, 'name' => 'current_total_discounts'],
            ['id' => 22, 'name' => 'current_total_discounts_set'],
            ['id' => 23, 'name' => 'current_total_duties_set'],
            ['id' => 24, 'name' => 'current_total_price'],
            ['id' => 25, 'name' => 'current_total_price_set'],
            ['id' => 26, 'name' => 'current_total_tax'],
            ['id' => 27, 'name' => 'current_total_tax_set'],
            ['id' => 28, 'name' => 'customer_locale'],
            ['id' => 29, 'name' => 'device_id'],
            ['id' => 30, 'name' => 'discount_codes'],
            ['id' => 31, 'name' => 'email'],
            ['id' => 32, 'name' => 'estimated_taxes'],
            ['id' => 33, 'name' => 'financial_status'],
            ['id' => 34, 'name' => 'fulfillment_status'],
            ['id' => 35, 'name' => 'landing_site'],
            ['id' => 36, 'name' => 'landing_site_ref'],
            ['id' => 37, 'name' => 'location_id'],
            ['id' => 38, 'name' => 'merchant_of_record_app_id'],
            ['id' => 39, 'name' => 'name'],
            ['id' => 40, 'name' => 'note'],
            ['id' => 41, 'name' => 'note_attributes'],
            ['id' => 42, 'name' => 'number'],
            ['id' => 43, 'name' => 'order_number'],
            ['id' => 44, 'name' => 'order_status_url'],
            ['id' => 45, 'name' => 'original_total_additional_fees_set'],
            ['id' => 46, 'name' => 'original_total_duties_set'],
            ['id' => 47, 'name' => 'payment_gateway_names'],
            ['id' => 48, 'name' => 'phone'],
            ['id' => 49, 'name' => 'po_number'],
            ['id' => 50, 'name' => 'presentment_currency'],
            ['id' => 51, 'name' => 'processed_at'],
            ['id' => 52, 'name' => 'reference'],
            ['id' => 53, 'name' => 'referring_site'],
            ['id' => 54, 'name' => 'source_identifier'],
            ['id' => 55, 'name' => 'source_name'],
            ['id' => 56, 'name' => 'source_url'],
            ['id' => 57, 'name' => 'subtotal_price'],
            ['id' => 58, 'name' => 'tags'],
            ['id' => 59, 'name' => 'tax_exempt'],
            ['id' => 60, 'name' => 'tax_lines'],
            ['id' => 61, 'name' => 'taxes_included'],
            ['id' => 62, 'name' => 'test'],
            ['id' => 63, 'name' => 'token'],
            ['id' => 64, 'name' => 'total_discounts'],
            ['id' => 65, 'name' => 'total_line_items_price'],
            ['id' => 66, 'name' => 'total_outstanding'],
            ['id' => 67, 'name' => 'total_price'],
            ['id' => 68, 'name' => 'total_shipping_price_set'],
            ['id' => 69, 'name' => 'total_tax'],
            ['id' => 70, 'name' => 'total_tax_set'],
            ['id' => 71, 'name' => 'total_tip_received'],
            ['id' => 72, 'name' => 'total_weight'],
            ['id' => 73, 'name' => 'updated_at'],
            ['id' => 74, 'name' => 'user_id'],
            ['id' => 75, 'name' => 'billing_address'],
            ['id' => 76, 'name' => 'customer'],
            ['id' => 77, 'name' => 'discount_applications'],
            ['id' => 78, 'name' => 'fulfillments'],
            ['id' => 79, 'name' => 'line_items'],
            ['id' => 80, 'name' => 'payment_terms'],
            ['id' => 81, 'name' => 'refunds'],
            ['id' => 82, 'name' => 'shipping_address'],
            ['id' => 83, 'name' => 'shipping_lines'],
            ['id' => 84, 'name' => 'sku'],
            ['id' => 85, 'name' => 'quantity'],
        ]);
    }
}
