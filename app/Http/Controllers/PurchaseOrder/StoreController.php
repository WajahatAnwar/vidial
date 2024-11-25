<?php

namespace App\Http\Controllers\PurchaseOrder;

use App\Http\Controllers\Controller;
use App\Models\AllInOne\User;
use App\Models\PurchaseOrder\PORule;
use App\Models\PurchaseOrder\POSetting;
use App\Models\PurchaseOrder\POStoreRule;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    public function get_stores_and_rules(Request $request)
    {
        $users_above = User::where('role_id', 2)->get();
        foreach ($users_above as $key => $user) {

            $check = POSetting::where('user_id', $user->id)->first();

            if (empty($check)) {
                $buttonData = [
                    'button_text' => "Place Order",
                    'icon_string' => "fa-solid fa-cart-shopping",
                    'button_placement' => "left",
                    'font_color' => '{"red":0,"green":0,"blue":0,"alpha":1}',
                    'background_color' => '{"red":255,"green":255,"blue":255,"alpha":1}',
                    'po_field_placeholder' => "Enter Po Id",
                    'discount_field_placeholder' => "Enter Discount Code",
                ];

                POSetting::updateOrCreate(['user_id' => $user->id], $buttonData);
            }
        }

        $rules = PORule::get();

        $users = User::with(['store_rule.rule', 'button_setting', 'rule_rel'])
            ->where('users.role_id', '=', 2)
            ->where('users.deleted_at', '=', NULL)
            ->when($request->get('q'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->orWhere('name', 'LIKE', '%' . $request->q . '%');
                    $q->orWhere('email', 'LIKE', '%' . $request->q . '%');
                    $q->orWhere('store_name', 'LIKE', '%' . $request->q . '%');
                });
            })->when($request->get('q5'), function ($q) use ($request) {
                $q->when($request->get('q5') == "id asc", function ($q) {
                    $q->orderBy("id", "asc");
                });
                $q->when($request->get('q5') == "id desc", function ($q) {
                    $q->orderBy("id", "desc");
                });
                $q->when($request->get('q5') == "name asc", function ($q) {
                    $q->orderBy("name", "asc");
                });
                $q->when($request->get('q5') == "name desc", function ($q) {
                    $q->orderBy("name", "desc");
                });
            })->cursorPaginate($request->page_count);

        return responseJson(true, 'Users list shown', $users, $rules);
    }

    public function remove_rule(Request $request)
    {
        $users_ids = json_decode($request->users_ids);
        $search_query = json_decode($request->search_query);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;

        if ($all_check == "true") {
            parse_str($search_query, $params);

            $users_ids = User::with('store_rule.rule')
                ->where('users.role_id', '=', 2)
                ->where('users.deleted_at', '=', NULL)
                ->when($request->get('q'), function ($q) use ($request) {
                    $q->where(function ($q) use ($request) {
                        $q->orWhere('name', 'LIKE', '%' . $request->q . '%');
                        $q->orWhere('email', 'LIKE', '%' . $request->q . '%');
                    });
                })->get()->pluck('id');
        }

        foreach ($users_ids as $key => $value) {
            POStoreRule::where('user_id', $value)->delete();
        }

        return responseJson(true, 'Rule Deleted from selected stores', $users_ids);
    }

    public function apply_rule(Request $request)
    {
        $rule = json_decode($request->rule);

        $users_ids = json_decode($request->users_ids);
        $search_query = json_decode($request->search_query);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;

        if ($all_check == "true") {
            parse_str($search_query, $params);

            $users_ids = User::with('store_rule.rule')
                ->where('users.role_id', '=', 2)
                ->where('users.deleted_at', '=', NULL)
                ->when($request->get('q'), function ($q) use ($request) {
                    $q->where(function ($q) use ($request) {
                        $q->orWhere('name', 'LIKE', '%' . $request->q . '%');
                        $q->orWhere('email', 'LIKE', '%' . $request->q . '%');
                    });
                })->get()->pluck('id');
        }

        foreach ($users_ids as $key => $value) {
            POStoreRule::where('user_id', $value)->delete();

            $new_store_rule = new POStoreRule;
            $new_store_rule->user_id = $value;
            $new_store_rule->rule_id = $rule->value;
            $new_store_rule->save();
        }

        return responseJson(true, 'Refine Export Products', $users_ids);
    }

    public function update_colors(Request $request)
    {
        $user = User::find($request->user_id);
        $user->icons_color = $request->color;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Colors updated for selected store',
        ]);
    }

    public function set_store_email(Request $request)
    {
        foreach ($request->emails as $key => $value) {
            if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                return response()->json([
                    'success' => false,
                    'message' => "$value Email Address is Invalid.",
                ]);
            }
        }

        $store = User::find($request->user_id);
        $store->store_emails = implode(",", $request->emails);
        $store->save();

        return response()->json([
            'success' => true,
            'message' => 'Email Adresses saved for the store.',
        ]);
    }
}
