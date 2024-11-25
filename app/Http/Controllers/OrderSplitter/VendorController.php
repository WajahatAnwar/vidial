<?php

namespace App\Http\Controllers\OrderSplitter;

use App\Http\Controllers\Controller;
use App\Imports\OrderSplitter\VendorsImport;
use App\Models\AllInOne\User;
use App\Models\InConnect\ShopifyVendor;
use App\Models\OrderSplitter\OSVendor;
use App\Models\OrderSplitter\OSVendorTag;
use App\Models\OrderSplitter\OSVendorVendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;

class VendorController extends Controller
{
    public function add_new_vendor(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'vendor_name' => 'required',
            'vendor_private_key' => 'required',
            'vendor_secret_key' => 'required',
            'vendor_store_id'  => 'required',
            'vendor_warehouse_id'  => 'required',
            'type'  => 'required',
        ], []);

        if ($validator->fails()) {
            $str['success'] = false;
            $error = $validator->errors()->toArray();
            foreach ($error as $x_value) {
                $err[] = $x_value[0];
            }
            $str['message'] = $err['0'];
            return $str;
        } else {

            $shopify_vendors = json_decode($request->shopify_vendors);
            $user = json_decode($request->user);

            if ($request->type == "shopify_vendor") {
                if ($user == false) {
                    return sendResponse(false, 'Shop is required if you are creating Vendor Based Vendor.');
                }
            }


            if ($request->type == "shopify_vendor") {
                if (count($shopify_vendors) == 0) {
                    return sendResponse(false, 'At least 1 Shopify Vendor required.');
                }
            }

            $new_vendor = new OSVendor;
            $new_vendor->vendor_name = $request->vendor_name;
            $new_vendor->vendor_private_key = $request->vendor_private_key;
            $new_vendor->vendor_secret_key = $request->vendor_secret_key;
            $new_vendor->vendor_store_id = $request->vendor_store_id;
            $new_vendor->vendor_warehouse_id = $request->vendor_warehouse_id;
            $new_vendor->type = $request->type;
            if ($request->user != "false")
                $new_vendor->user_id = $user->value;
            $new_vendor->save();

            foreach (json_decode($request->tags) as $key => $tag) {
                $new_vendor_tag = new OSVendorTag;
                $new_vendor_tag->o_s_vendor_id = $new_vendor->id;
                $new_vendor_tag->name = $tag;
                $new_vendor_tag->save();
            }

            foreach ($shopify_vendors as $key => $vendor) {
                $new_vendor_vendor = new OSVendorVendor;
                $new_vendor_vendor->o_s_vendor_id = $new_vendor->id;
                $new_vendor_vendor->shopify_vendor_id = $vendor->value;
                $new_vendor_vendor->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'New Vendor Added',
            ]);
        }
    }

    public function get_vendors(Request $request)
    {
        $products = OSVendor::with(['tags_rel', 'vendors.shopify_vendor'])->when($request->get('q'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->orWhere('id', 'LIKE', '%' . $request->q . '%');
                $q->orWhere('vendor_name', 'LIKE', '%' . $request->q . '%');
                $q->orWhere('vendor_store_id', 'LIKE', '%' . $request->q . '%');
            });
        })->when($request->get('q4'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->orWhere('id', 'LIKE', '%' . $request->q4 . '%');
                $q->orWhere('vendor_name', 'LIKE', '%' . $request->q4 . '%');
                $q->orWhere('vendor_store_id', 'LIKE', '%' . $request->q4 . '%');
            });
        })->when($request->get('q5'), function ($q) use ($request) {
            $q->when($request->get('q5') == "id asc", function ($q) {
                $q->orderBy("id", "asc");
            });
            $q->when($request->get('q5') == "id desc", function ($q) {
                $q->orderBy("id", "desc");
            });
            $q->when($request->get('q5') == "name asc", function ($q) {
                $q->orderBy("vendor_name", "asc");
            });
            $q->when($request->get('q5') == "name desc", function ($q) {
                $q->orderBy("vendor_name", "desc");
            });
            $q->when($request->get('q5') == "store asc", function ($q) {
                $q->orderBy("vendor_store_id", "asc");
            });
            $q->when($request->get('q5') == "store desc", function ($q) {
                $q->orderBy("vendor_store_id", "desc");
            });
        })->cursorPaginate($request->page_count);

        return responseJson(true, 'Vendors retrieved successfully!', $products);
    }

    public function delete_vendor(Request $request)
    {
        OSVendor::where('id', $request->id)->delete();

        $vendor_ids = json_decode($request->vendor_ids);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;

        if ($all_check == "true") {
            parse_str($search_query, $params);

            $vendor_ids = OSVendor::when($request->get('q'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->orWhere('id', 'LIKE', '%' . $request->q . '%');
                    $q->orWhere('vendor_name', 'LIKE', '%' . $request->q . '%');
                    $q->orWhere('vendor_store_id', 'LIKE', '%' . $request->q . '%');
                });
            })->when($request->get('q4'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->orWhere('id', 'LIKE', '%' . $request->q4 . '%');
                    $q->orWhere('vendor_name', 'LIKE', '%' . $request->q4 . '%');
                    $q->orWhere('vendor_store_id', 'LIKE', '%' . $request->q4 . '%');
                });
            })->get()->pluck('id');
        }

        foreach ($vendor_ids as $key => $value) {
            OSVendor::find($value)->delete();
        }

        return sendResponse(true, 'Vendors Deleted.');
    }

    public function update_vendor(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'vendor_name' => 'required',
            'vendor_private_key' => 'required',
            'vendor_secret_key' => 'required',
            'vendor_store_id'  => 'required',
            'vendor_warehouse_id'  => 'required',
            'type'  => 'required',
        ], []);

        if ($validator->fails()) {
            $str['success'] = false;
            $error = $validator->errors()->toArray();
            foreach ($error as $x_value) {
                $err[] = $x_value[0];
            }
            $str['message'] = $err['0'];
            return $str;
        } else {


            $shopify_vendors = json_decode($request->shopify_vendors);
            $user = json_decode($request->user);

            if ($request->type == "shopify_vendor") {
                if (count($shopify_vendors) == 0) {
                    return sendResponse(false, 'At least 1 Shopify Vendor required.');
                }
            }

            if ($request->type == "shopify_vendor") {
                if ($user == false) {
                    return sendResponse(false, 'Shop is required if you are creating Vendor Based Vendor.');
                }
            }

            $existing_vendor = OSVendor::find($request->id);
            $existing_vendor->vendor_name = $request->vendor_name;
            $existing_vendor->vendor_private_key = $request->vendor_private_key;
            $existing_vendor->vendor_secret_key = $request->vendor_secret_key;
            $existing_vendor->vendor_store_id = $request->vendor_store_id;
            $existing_vendor->vendor_warehouse_id = $request->vendor_warehouse_id;
            $existing_vendor->type = $request->type;
            if ($request->user != "false")
                $existing_vendor->user_id = $user->value;
            $existing_vendor->save();

            OSVendorTag::where('o_s_vendor_id', $request->id)->delete();

            foreach (json_decode($request->tags) as $key => $tag) {
                $new_vendor_tag = new OSVendorTag;
                $new_vendor_tag->o_s_vendor_id = $existing_vendor->id;
                $new_vendor_tag->name = $tag;
                $new_vendor_tag->save();
            }

            OSVendorVendor::where('o_s_vendor_id', $request->id)->delete();

            foreach ($shopify_vendors as $key => $vendor) {
                $new_vendor_vendor = new OSVendorVendor;
                $new_vendor_vendor->o_s_vendor_id = $existing_vendor->id;
                $new_vendor_vendor->shopify_vendor_id = $vendor->value;
                $new_vendor_vendor->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Existing Vendor updated',
            ]);
        }
    }

    public function import_vendors(Request $request)
    {
        Excel::import(new VendorsImport, $request->file('uploaded_csv'));

        return response()->json([
            'success' => true,
            'message' => 'CSV Uploaded Success',
            'data' => $request,
        ]);
    }

    public function get_shopify_vendors()
    {
        $vendors = ShopifyVendor::get();
        $shops = User::where('role_id', 2)->whereNotNull('password')->whereNull('deleted_at')->orderBy('store_name', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Shopify Vendors retrieved successfully!',
            'data' => $vendors,
            'data2' => $shops,
        ]);
    }
}
