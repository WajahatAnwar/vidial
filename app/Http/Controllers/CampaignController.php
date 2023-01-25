<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\CampaignDiscount;
use App\Models\Collection;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use stdClass;

class CampaignController extends Controller
{
    // private function manage_campaign($request,$shop,$target_selection_type,$discount_type,$product_ids_list,
    // $collection_ids_list,$start_date_inside,$end_date_inside,$discount_rule)
    // {
    //     foreach (json_decode($request->discount_tags) as $key => $value) {

    //         $code = Str::random(8);

    //         $createPriceRule = $shop->api()->rest('POST', '/admin/api/2021-10/price_rules.json', [
    //             'price_rule' => [
    //                 'title' => "$request->campaign_name $key",
    //                 'target_type' => "line_item",
    //                 'target_selection' => $target_selection_type,
    //                 'allocation_method' => 'across',
    //                 'usage_limit' => 1,
    //                 'once_per_customer' => true,
    //                 "value_type" => $discount_type,
    //                 "value" => "-$value",
    //                 'customer_selection' => 'all',
    //                 'entitled_variant_ids' => [],
    //                 "entitled_product_ids" => $product_ids_list,
    //                 "entitled_collection_ids" => $collection_ids_list,
    //                 'starts_at' => $start_date_inside,
    //                 'ends_at' => $end_date_inside,
    //             ]
    //         ]);

    //         // Log::info(json_encode($createPriceRule));

    //         $priceRule = $createPriceRule['body']['price_rule'];
    //         $discountCode = $shop->api()->rest('POST', '/admin/api/2022-01/price_rules/' . $priceRule['id'] . '/discount_codes.json', [
    //             'discount_code' => [
    //                 'code' => $code,
    //             ]
    //         ]);

    //         // Log::info(json_encode($discountCode));

    //         $new_discount_code = new CampaignDiscount;
    //         $new_discount_code->campaign_id = $discount_rule->id;
    //         $new_discount_code->discount_code_id = $discountCode['body']['discount_code']['id'];
    //         $new_discount_code->price_rule_id = $createPriceRule['body']['price_rule']['id'];
    //         $new_discount_code->discount_code = $code;
    //         $new_discount_code->discount_tag = $value;
    //         $new_discount_code->save();
    //     }
    // }

    public function get_create_campaign_data()
    {
        $current_user = Auth::user();
        $shop = User::find($current_user->id);

        $check = Product::where('user_id', $shop->id)->first();

        if (empty($check)) {
            sync_products($shop);
        }

        $products = Product::where('user_id', $shop->id)->get();
        $collections = Collection::where('user_id', $shop->id)->get();

        $response = $shop->api()->rest('get', '/admin/api/2023-01/webhooks.json', []);

        return response()->json([
            'success' => true,
            'message' => 'Products and collections shown',
            'data1' => $products,
            'data2' => $collections,
            'data3' => $response,
        ]);
    }

    public function add_new_campaign(Request $request)
    {
        // return $request;

        $validator = Validator::make($request->all(), [
            'campaign_name' => 'required',
            'discount_by' => 'required',
            'discount_type' => 'required',
            'end_date' => 'required',
            'start_date' => 'required',
            'further_option' => 'required',
        ], []);

        if ($validator->fails()) {
            $str['success'] = false;
            $error = $validator->errors()->toArray();
            foreach ($error as $x_value) {
                $err[] = $x_value[0];
            }
            $str['message'] = $err['0'];
            // $str['data'] = $validator->errors()->toArray();
            return $str;
        } else {

            //VALIDATING DISCOUNT CODES
            if(count(json_decode($request->discount_tags)) == 0) {
                $str['success'] = false;
                $str['message'] = "At least one discount amount is required.";
                return $str;
            }

            $current_user = Auth::user();
            $shop = User::find($current_user->id);

            //INITIAL VARIABLES
            $discount_rule = "";
            $message = "New Campaign Created Successfully";
            $start_date_inside = Carbon::now()->subDays(10);
            $end_date_inside = Carbon::now()->subDays(10);

            if (isset($request->editing_check)) {
                $discount_rule = Campaign::find($request->campaign_id);
            } else {
                $discount_rule = new Campaign;
            }

            $discount_rule->user_id = $shop->id;
            $discount_rule->name = $request->campaign_name;
            $discount_rule->discount_on = $request->discount_by;
            $discount_rule->discount_on_data = $request->further_option;
            $discount_rule->start_date = $request->start_date;
            $discount_rule->end_date = $request->end_date;
            $discount_rule->discount_type = $request->discount_type;
            $discount_rule->discount_tags = $request->discount_tags;
            $discount_rule->save();

            return response()->json([
                'success' => true,
                'message' =>  $message,
            ]);
        }

        // if (isset($request->editing_check)) {

        //     $delete_discount_rules = CampaignDiscount::where('campaign_id', $request->campaign_id)->get();

        //     foreach ($delete_discount_rules as $key => $value) {
        //         $shop->api()->rest('delete', '/admin/api/2022-07/price_rules/' . $value->price_rule_id . '/discount_codes/' . $value->discount_code_id . '.json', []);
        //         $shop->api()->rest('delete', '/admin/api/2022-04/price_rules/' . $value->price_rule_id . '.json', []);
        //     }

        //     CampaignDiscount::where('campaign_id', $request->campaign_id)->delete();

        //     if ($discount_rule->status == true) {
        //         $start_date_inside = $request->start_date;
        //         $end_date_inside = $request->end_date;
        //     }

        //     $message = "Existing campaign updated successfully";
        // }

        // $discount_type = "fixed_amount";
        // $target_selection_type = "all";
        // $product_ids_list = [];
        // $collection_ids_list = [];

        // if ($request->discount_type == "percentage") {
        //     $discount_type = "percentage";
        // } else if ($request->discount_type == "fixed") {
        //     $discount_type = "fixed_amount";
        // }

        // if ($request->discount_by == "product") {
        //     $target_selection_type = "entitled";
        //     $product_ids_list = [$request->further_option];
        // } else if ($request->discount_by == "collection") {
        //     $target_selection_type = "entitled";
        //     $collection_ids_list = [$request->further_option];
        // }

        // $this->manage_campaign($request,$shop,$target_selection_type,$discount_type,$product_ids_list,
        // $collection_ids_list,$start_date_inside,$end_date_inside,$discount_rule);
    }

    public function get_all_campaigns()
    {
        $all_campaigns = Campaign::get();

        return response()->json([
            'success' => true,
            'message' => 'All campaigns shown',
            'data' => $all_campaigns,
        ]);
    }

    public function change_campaign_status(Request $request)
    {
        // return $request;
        // $current_user = Auth::user();
        // $shop = User::find($current_user->id);

        // $campaign = Campaign::find($request->campaign_id);
        // $campaign_discounts = CampaignDiscount::where('campaign_id', $request->campaign_id)->get();

        // if ($request->new_status == 'true') {
        //     $start_date = $campaign->start_date;
        //     $end_date = $campaign->end_date;
        // } else {
        //     $start_date = Carbon::now()->subDays(10);
        //     $end_date = Carbon::now()->subDays(10);
        // }

        // foreach ($campaign_discounts as $key => $value) {

        //     $createPriceRule = $shop->api()->rest('PUT', '/admin/api/2021-10/price_rules/' . $value->price_rule_id . '.json', [
        //         'price_rule' => [
        //             'starts_at' => $start_date,
        //             'ends_at' => $end_date,
        //         ]
        //     ]);

        //     Log::info(json_encode($createPriceRule));
        // }

        // return $campaign_discounts;

        $campaign = Campaign::find($request->campaign_id);
        $campaign->status = ($request->new_status === 'true');
        $campaign->save();

        return response()->json([
            'success' => true,
            'message' => 'Campaign status updated successfully',
        ]);
    }

    public function get_editing_campaign(Request $request)
    {
        $products = Product::get();
        $collections = Collection::get();
        $campaign = Campaign::find($request->campaign_id);
        // $campaign_discounts = CampaignDiscount::where('campaign_id', $request->campaign_id)->get();

        return response()->json([
            'success' => true,
            'message' => 'Products and collections shown. Campaign also shown',
            'data1' => $products,
            'data2' => $collections,
            'data3' => $campaign,
            // 'data4' => $campaign_discounts,
        ]);
    }

    public function make_campaign_duplicate(Request $request)
    {
        // return $request;

        // return $request;

        $validator = Validator::make($request->all(), [
            'campaign_name' => 'required',
            'discount_by' => 'required',
            'discount_type' => 'required',
            'end_date' => 'required',
            'start_date' => 'required',
            'further_option' => 'required',
        ], []);

        if ($validator->fails()) {
            $str['success'] = false;
            $error = $validator->errors()->toArray();
            foreach ($error as $x_value) {
                $err[] = $x_value[0];
            }
            $str['message'] = $err['0'];
            // $str['data'] = $validator->errors()->toArray();
            return $str;
        } else {

            //VALIDATING DISCOUNT CODES
            if(count(json_decode($request->discount_tags)) == 0) {
                $str['success'] = false;
                $str['message'] = "At least one discount amount is required.";
                return $str;
            }

            $current_user = Auth::user();
            $shop = User::find($current_user->id);

            // $start_date_inside = Carbon::now()->subDays(10);
            // $end_date_inside = Carbon::now()->subDays(10);

            $discount_rule = Campaign::find($request->campaign_id);

            $d_discount_rule = new Campaign;
            $d_discount_rule->user_id = $shop->id;
            $d_discount_rule->name = $discount_rule->name . " Copy";
            $d_discount_rule->discount_on = $discount_rule->discount_on;
            $d_discount_rule->discount_on_data = $discount_rule->discount_on_data;
            $d_discount_rule->start_date = $discount_rule->start_date;
            $d_discount_rule->end_date = $discount_rule->end_date;
            $d_discount_rule->discount_type = $discount_rule->discount_type;
            $d_discount_rule->discount_tags = $discount_rule->discount_tags;
            $d_discount_rule->save();

            return response()->json([
                'success' => true,
                'message' => 'Campaign Duplicated Successfully',
            ]);

        }
        // $discount_type = "fixed_amount";
        // $target_selection_type = "all";
        // $product_ids_list = [];
        // $collection_ids_list = [];

        // if ($discount_rule->discount_type == "percentage") {
        //     $discount_type = "percentage";
        // } else if ($discount_rule->discount_type == "fixed") {
        //     $discount_type = "fixed_amount";
        // }

        // if ($discount_rule->discount_on == "product") {
        //     $target_selection_type = "entitled";
        //     $product_ids_list = [$discount_rule->discount_on_data];
        // } else if ($discount_rule->discount_on == "collection") {
        //     $target_selection_type = "entitled";
        //     $collection_ids_list = [$discount_rule->discount_on_data];
        // }

        // $request = new stdClass;
        // $request->discount_tags = $discount_rule->discount_tags;
        // $request->campaign_name = $discount_rule->name." Copy";

        // $discount_rule = $d_discount_rule;

        // $this->manage_campaign($request,$shop,$target_selection_type,$discount_type,$product_ids_list,
        // $collection_ids_list,$start_date_inside,$end_date_inside,$discount_rule);
    }

    public function delete_campaign(Request $request)
    {
        // return $request;
        // $current_user = Auth::user();
        // $shop = User::find($current_user->id);

        // $campaign_discounts = CampaignDiscount::where('campaign_id',$request->campaign_id)->get();

        // foreach ($campaign_discounts as $key => $value) {
        //     $shop->api()->rest('delete', '/admin/api/2022-07/price_rules/' . $value->price_rule_id . '/discount_codes/' . $value->discount_code_id . '.json', []);
        //     $shop->api()->rest('delete', '/admin/api/2022-04/price_rules/' . $value->price_rule_id . '.json', []);
        // }

        // CampaignDiscount::where('campaign_id', $request->campaign_id)->delete();

        Campaign::find($request->campaign_id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Campaign Deleted Successfully',
        ]);
    }
}
