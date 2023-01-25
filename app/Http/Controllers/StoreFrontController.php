<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\CampaignDiscount;
use App\Models\DiscountView;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class StoreFrontController extends Controller
{
    public function get_campaign_discount(Request $request)
    {
        // return $request;

        $shop = User::where('name', $request->shop)->first();

        $shop_settings = Setting::where('user_id',$shop->id)->first();

        // return $shop;

        if (empty($shop)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid Shop Name.',
            ]);
        }

        $campaign = Campaign::find($request->campaign_id);

        if (empty($campaign)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid Campaign ID.',
            ]);
        }

        if($campaign->status == false)  {
            return response()->json([
                'success' => false,
                'message' => 'Campaign is not active.',
            ]);
        }

        $campaign->discount_tags = json_decode($campaign->discount_tags);

        $index = rand(0, count($campaign->discount_tags) - 1);

        $discount_type = "fixed_amount";
        $target_selection_type = "all";
        $product_ids_list = [];
        $collection_ids_list = [];

        if ($campaign->discount_type == "percentage") {
            $discount_type = "percentage";
        } else if ($campaign->discount_type == "fixed") {
            $discount_type = "fixed_amount";
        }

        if ($campaign->discount_on == "product") {
            $target_selection_type = "entitled";
            $product_ids_list = [$campaign->discount_on_data];
        } else if ($campaign->discount_on == "collection") {
            $target_selection_type = "entitled";
            $collection_ids_list = [$campaign->discount_on_data];
        }

        $code = Str::random(8);

        $createPriceRule = $shop->api()->rest('POST', '/admin/api/2021-10/price_rules.json', [
            'price_rule' => [
                'title' => "$campaign->campaign_name " . $campaign->discount_tags[$index],
                'target_type' => "line_item",
                'target_selection' => $target_selection_type,
                'allocation_method' => 'across',
                'usage_limit' => 1,
                'once_per_customer' => true,
                "value_type" => $discount_type,
                "value" => "-" . $campaign->discount_tags[$index],
                'customer_selection' => 'all',
                'entitled_variant_ids' => [],
                "entitled_product_ids" => $product_ids_list,
                "entitled_collection_ids" => $collection_ids_list,
                'starts_at' => $campaign->start_date,
                'ends_at' => $campaign->end_date,
            ]
        ]);

        // Log::info(json_encode($createPriceRule));

        $priceRule = $createPriceRule['body']['price_rule'];
        $discountCode = $shop->api()->rest('POST', '/admin/api/2022-01/price_rules/' . $priceRule['id'] . '/discount_codes.json', [
            'discount_code' => [
                'code' => $code,
            ]
        ]);

        // Log::info(json_encode($discountCode));

        $new_discount_code = new CampaignDiscount;
        $new_discount_code->user_id = $shop->id;
        $new_discount_code->campaign_id = $campaign->id;
        $new_discount_code->discount_code_id = $discountCode['body']['discount_code']['id'];
        $new_discount_code->price_rule_id = $createPriceRule['body']['price_rule']['id'];
        $new_discount_code->discount_code = $code;
        $new_discount_code->discount_tag = $campaign->discount_tags[$index];
        $new_discount_code->save();

        $new_view = new DiscountView;
        $new_view->user_id = $shop->id;
        $new_view->campaign_id = $campaign->id;
        $new_view->discount_code = $code;
        $new_view->click = 1;
        $new_view->save();

        return response()->json([
            'success' => true,
            'message' => 'New discount Generated.',
            'data' => $code,
            'data1' => $campaign->discount_tags[$index],
            'data2' => $campaign->discount_type,
            'data3' => $campaign->end_date,
            'data4' => $shop_settings->pop_up_type,
            'data5' => $shop_settings->pop_up_data,
        ]);
    }
}
