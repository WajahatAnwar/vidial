<?php

namespace App\Http\Controllers\PurchaseOrder;

use App\Http\Controllers\Controller;
use App\Models\AllInOne\User;
use App\Models\PurchaseOrder\POLocationShipping;
use App\Models\PurchaseOrder\POPriceShipping;
use App\Models\PurchaseOrder\PORuleType;
use App\Models\PurchaseOrder\POShippingRule;
use Database\Seeders\PORuleTypeSeeder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use PhpParser\Node\Expr\FuncCall;

class ShippingController extends Controller
{
    public function add_edit_price_shipping(Request $request)
    {
        // return $request;

        $validator = Validator::make($request->all(), [
            'min' => 'required',
            'max' => 'required',
            'shipping_price' => 'required',
        ], []);

        if ($validator->fails()) {
            return simpleValidate($validator);
        }

        if ($request->edit_id == "false") {
            $popriceShipping = new POPriceShipping;
        } else {
            $popriceShipping = POPriceShipping::find($request->edit_id);
        }

        $popriceShipping->min = $request['min'];
        $popriceShipping->max = $request['max'];
        $popriceShipping->shipping_price = $request['shipping_price'];
        $popriceShipping->save();

        return sendResponse(true, 'Shipping price added to system.');
    }

    public function delete_price_shipping(Request $request)
    {
        $price_shipping = POPriceShipping::find($request->price_shipping_id);
        $price_shipping->delete();

        return sendResponse(true, 'Selected price shipping is deleted');
    }

    public function get_shipping_data(Request $request)
    {
        $price_shippings = POPriceShipping::get();
        $location_shippings = POLocationShipping::get();
        $po_rule_types = PORuleType::get();
        $rule_shippings = POShippingRule::with('rule_rel')->get();

        $object["price_shippings"] = $price_shippings;
        $object["location_shippings"] = $location_shippings;
        $object["po_rule_types"] = $po_rule_types;
        $object["rule_shippings"] = $rule_shippings;

        return sendResponse(true, 'Shipping price added to system.', $object);
    }

    public function add_edit_location_shipping(Request $request)
    {
        // return $request;

        $validator = Validator::make($request->all(), [
            'location_type' => 'required',
            'location_name' => 'required',
            'shipping_price' => 'required',
        ], []);

        if ($validator->fails()) {
            return simpleValidate($validator);
        }

        if ($request->edit_id == "false") {
            $polocationShipping = new POLocationShipping;
        } else {
            $polocationShipping = POLocationShipping::find($request->edit_id);
        }

        $polocationShipping->location_type = $request['location_type'];
        $polocationShipping->location_name = $request['location_name'];
        $polocationShipping->shipping_price = $request['shipping_price'];
        $polocationShipping->save();

        return sendResponse(true, 'Shipping price added to system.');
    }

    public function delete_location_shipping(Request $request)
    {
        $location_shipping = POLocationShipping::find($request->location_shipping_id);
        $location_shipping->delete();

        return sendResponse(true, 'Selected location shipping is deleted');
    }

    public function add_edit_rule_shipping(Request $request)
    {
        // return $request;

        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'p_o_rule_type_id' => 'required',
            'first_value' => 'required',
            // 'shipping_price' => 'required',
        ], []);

        if ($validator->fails()) {
            return simpleValidate($validator);
        }

        if ($request->p_o_rule_type_id == 1 || $request->p_o_rule_type_id == 2) {
            if ($request->shipping_price == "" || $request->shipping_price == false || $request->shipping_price == NULL) {
                sendResponse(false, "Shipping price is required.");
            }
        }

        if ($request->edit_id == "false") {
            $poruleShipping = new POShippingRule;
        } else {
            $poruleShipping = POShippingRule::find($request->edit_id);
        }

        $poruleShipping->name = $request['name'];
        $poruleShipping->p_o_rule_type_id = $request['p_o_rule_type_id'];
        $poruleShipping->first_value = $request['first_value'];

        if ($request->p_o_rule_type_id == 1 || $request->p_o_rule_type_id == 2)
            $poruleShipping->shipping_price = $request['shipping_price'];

        $poruleShipping->save();

        return sendResponse(true, 'Rule Bases Shipping added to system.');
    }

    public function delete_rule_shipping(Request $request)
    {
        $rule_shipping = POShippingRule::find($request->rule_shipping_id);
        $rule_shipping->delete();

        return sendResponse(true, 'Selected rule shipping is deleted');
    }













    public function delete_rule_two(Request $request)
    {
        $users_ids = json_decode($request->users_ids);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;

        if ($all_check == "true") {
            parse_str($search_query, $params);

            $users_ids = User::where('role_id', '=', 2)
                ->where('deleted_at', '=', NULL)
                ->when($request->get('q'), function ($q) use ($request) {
                    $q->where(function ($q) use ($request) {
                        $q->orWhere('name', 'LIKE', '%' . $request->q . '%');
                        $q->orWhere('email', 'LIKE', '%' . $request->q . '%');
                    });
                })->get()->pluck('id');
        }

        foreach ($users_ids as $key => $value) {
            $user = User::where('id', $value)->first();
            $user->p_o_shipping_rule_id = NULL;
            $user->save();
        }

        return responseJson(true, 'Rule Deleted from selected stores', $users_ids);
    }

    public function apply_rule_two(Request $request)
    {
        $rule = json_decode($request->rule);

        $users_ids = json_decode($request->users_ids);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;

        if ($all_check == "true") {
            parse_str($search_query, $params);

            $users_ids = User::where('role_id', '=', 2)
                ->where('deleted_at', '=', NULL)
                ->when($request->get('q'), function ($q) use ($request) {
                    $q->where(function ($q) use ($request) {
                        $q->orWhere('name', 'LIKE', '%' . $request->q . '%');
                        $q->orWhere('email', 'LIKE', '%' . $request->q . '%');
                    });
                })->get()->pluck('id');
        }

        foreach ($users_ids as $key => $value) {

            $user = User::find($value);
            $user->p_o_shipping_rule_id = $rule->value;
            $user->save();
        }

        return responseJson(true, 'Refine Export Products', $users_ids);
    }
}
