<?php

namespace App\Http\Controllers\PurchaseOrder;

use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;
use App\Models\AllInOne\User;
use App\Models\PurchaseOrder\PORule;
use App\Models\PurchaseOrder\POStoreRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RuleController extends Controller
{
    public function stores_list()
    {
        $stores = User::where('role_id', 2)->get();

        return response()->json([
            'success' => true,
            'message' => 'Stores list shown.',
            'data' => $stores,
        ]);
    }

    public function add_new_rule(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'rule_name' => 'required|string',
        ], []);

        if ($validator->fails()) {
            $error = $validator->errors()->toArray();
            foreach ($error as $x => $x_value) {
                $err[] = $x_value[0];
            }

            return response()->json([
                'success' => false,
                'message' => $err['0'],
            ]);
        } else {

            if ($request->tags_dependency == "true") {

                if (count(json_decode($request->rule_tags)) < 1) {
                    return response()->json([
                        'success' => false,
                        'message' => "There must be one tag at least in rule",
                    ]);
                }

                if (!isset($request->rule_type))
                    responseJson(false, "Rule type is required to tag dependency rule.");
            }

            $new_rule = new PORule;
            $new_rule->rule_name = $request->rule_name;
            $new_rule->tags_dependency = ($request->tags_dependency === 'true');

            if (isset($request->rule_type)) {
                $new_rule->rule_type = $request->rule_type;
                $new_rule->rule_tags = $request->rule_tags;
            }

            $new_rule->save();

            $stores_list = json_decode($request->rule_stores);
            foreach ($stores_list as $key => $value) {
                POStoreRule::where('user_id', $value->value)->delete();
                $new_store_rule = new POStoreRule;
                $new_store_rule->user_id = $value->value;
                $new_store_rule->rule_id = $new_rule->id;
                $new_store_rule->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'New PORule Added',
            ]);
        }
    }

    public function get_rules(Request $request)
    {
        $rules = PORule::when($request->get('q'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->orWhere('rule_name', 'LIKE', '%' . $request->q . '%');
                $q->orWhere('rule_tags', 'LIKE', '%' . $request->q . '%');
            });
        })->when($request->get('q5'), function ($q) use ($request) {
            $q->when($request->get('q5') == "id asc", function ($q) {
                $q->orderBy("id", "asc");
            });
            $q->when($request->get('q5') == "id desc", function ($q) {
                $q->orderBy("id", "desc");
            });
            $q->when($request->get('q5') == "name asc", function ($q) {
                $q->orderBy("rule_name", "asc");
            });
            $q->when($request->get('q5') == "name desc", function ($q) {
                $q->orderBy("rule_name", "desc");
            });
        })->cursorPaginate($request->page_count);

        return responseJson(true, 'Rules list shown', $rules);
    }

    public function edit_existing_rule(Request $request)
    {
        // return $request;
        $validator = Validator::make($request->all(), [
            'id' => 'required',
            'rule_name' => 'required|string',
        ], [
            // 'city.required' => "State field is required",
        ]);
        if ($validator->fails()) {
            $error = $validator->errors()->toArray();
            foreach ($error as $x => $x_value) {
                $err[] = $x_value[0];
            }

            return response()->json([
                'success' => false,
                'message' => $err['0'],
            ]);
        } else {

            if ($request->tags_dependency == "true") {

                if (count(json_decode($request->rule_tags)) < 1) {
                    return response()->json([
                        'success' => false,
                        'message' => "There must be one tag at least in rule",
                    ]);
                }

                if (!isset($request->rule_type))
                    responseJson(false, "Rule type is required to tag dependency rule.");
            }

            $new_rule = PORule::find($request->id);
            $new_rule->rule_name = $request->rule_name;
            $new_rule->tags_dependency = ($request->tags_dependency === 'true');

            if (isset($request->rule_type)) {
                $new_rule->rule_type = $request->rule_type;
                $new_rule->rule_tags = $request->rule_tags;
            }

            $new_rule->save();

            POStoreRule::where('rule_id', $request->id)->delete();

            $stores_list = json_decode($request->rule_stores);
            foreach ($stores_list as $key => $value) {
                POStoreRule::where('user_id', $value->value)->delete();
                $new_store_rule = new POStoreRule;
                $new_store_rule->user_id = $value->value;
                $new_store_rule->rule_id = $new_rule->id;
                $new_store_rule->save();
            }



            return response()->json([
                'success' => true,
                'message' => 'Existing PORule Updated',
            ]);
        }
    }

    public function delete_rule(Request $request)
    {
        POStoreRule::where('rule_id', $request->id)->delete();

        $existing_rule = PORule::find($request->id);

        $existing_rule->delete();

        return response()->json([
            'success' => true,
            'message' => 'Existing PORule Deleted',
        ]);
    }
}
