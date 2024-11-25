<?php

namespace App\Http\Controllers\VirtualOptions;

use App\Http\Controllers\Controller;

use App\Models\VirtualOptions\InputFieldsProduct;
use App\Models\VirtualOptions\LogoChargesProduct;
use App\Models\VirtualOptions\LogoGroupDetail;
use App\Models\AllInOne\Product;
use App\Models\AllInOne\ProductLocation;
use App\Models\AllInOne\User;
use App\Models\PurchaseOrder\POCSVRecord;
use App\Models\VirtualOptions\DropdownChargesProduct;
use App\Models\VirtualOptions\InputFieldThread;
use App\Models\VirtualOptions\OptionSet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class StoreFrontController extends Controller
{
    public function get_product_options(Request $request)
    {
        $shop = User::where('name', $request->shop)->first();

        if(!$shop)
            return sendResponse(false, "Shop disabled, uninstalled or not found");

        $product = Product::with([
            'option_set.options_sort',
            'option_set.options.note_detail',
            // 'option_set.options.drop_detail.families.colors',
            'option_set.options.drop_detail.families.colors' => function ($query) {
                $query->select('colors.id', 'colors.color');
            },
            'option_set.options.file_detail',
            'option_set.options.input_detail.threads',
            'option_set.options.text_detail',
            // 'option_set.options.logo_detail.logo.families.colors',
            'option_set.options.logo_detail.logo.families.colors' => function ($query) {
                $query->select('colors.id', 'colors.color');
            },
            'option_set.options.conditions.option_back.drop_detail',
            'option_set.options.conditions.option_back.text_detail',
            'option_set.options.conditions.option_back.logo_detail.logo',
        ])->where('product_id', $request->product_id)->where('user_id', $shop->id)->first();

        if ($product)
            $product = $product->toArray();

        if (isset($product['option_set'])) {

            $result = collect($product['option_set']['options']);

            $result->transform(function ($item) {
                if (count($item['logo_detail']) > 0) {
                    foreach ($item['logo_detail'] as $key1 => &$logo_detail) {
                        if (count($logo_detail['logo']['families']) > 0) {
                            foreach ($logo_detail['logo']['families'] as $key2 => &$family) {
                                if (count($family['colors']) > 0) {
                                    $family['colors'] = collect($family['colors'])->pluck('color');
                                }
                            }
                        }
                    }
                }

                if (count($item['drop_detail']) > 0) {
                    foreach ($item['drop_detail'] as $key1 => &$drop_detail) {
                        if (count($drop_detail['families']) > 0) {
                            foreach ($drop_detail['families'] as $key2 => &$family) {
                                if (count($family['colors']) > 0) {
                                    $family['colors'] = collect($family['colors'])->pluck('color');
                                }
                            }
                        }
                    }
                }
                return $item;
            });

            //sorting array
            $pre_final_array_two = $product['option_set']['options_sort'];
            usort($pre_final_array_two, function ($a, $b) {
                return $a['sort_number'] - $b['sort_number'];
            });
            $product['option_set']['options_sort'] = $pre_final_array_two;

            //COLOR AND SIZE CHECK
            $color_size_check = false;
            foreach ($pre_final_array_two as $key => $option_inside) {

                $object_two['conditions'] = [];
                $object_two['conditions_status'] = 0;
                $object_two['drop_detail'] = [];
                $object_two['file_detail'] = NULL;
                $object_two['frontend_name'] = "";
                $object_two['id'] = NULL;
                $object_two['input_detail'] = [];
                $object_two['logo_detail'] = [];
                $object_two['note_detail'] = NULL;
                $object_two['option_name'] = "";
                $object_two['option_type_id'] = NULL;
                $object_two['required'] = 0;
                $object_two['text_detail'] = NULL;

                if ($option_inside['extra'] == "Color") {
                    $color_size_check = true;
                    $object_two['pivot']['sort_number'] = $option_inside['sort_number'];
                    $object_two['extra'] = $option_inside['extra'];
                    $result->push($object_two);
                }


                if ($option_inside['extra'] == "Size") {
                    $color_size_check = true;
                    $object_two['pivot']['sort_number'] = $option_inside['sort_number'];
                    $object_two['extra'] = $option_inside['extra'];
                    $result->push($object_two);
                }
            }

            if (!$color_size_check) {

                $object_two['conditions'] = [];
                $object_two['conditions_status'] = 0;
                $object_two['drop_detail'] = [];
                $object_two['file_detail'] = NULL;
                $object_two['frontend_name'] = "";
                $object_two['id'] = NULL;
                $object_two['input_detail'] = [];
                $object_two['logo_detail'] = [];
                $object_two['note_detail'] = NULL;
                $object_two['option_name'] = "";
                $object_two['option_type_id'] = NULL;
                $object_two['required'] = 0;
                $object_two['text_detail'] = NULL;

                $object_two['pivot']['sort_number'] = NULL;
                $object_two['extra'] = "Size";
                $result->prepend($object_two);

                $object_two['pivot']['sort_number'] = NULL;
                $object_two['extra'] = "Color";
                $result->prepend($object_two);
            }

            $product['option_set']['options'] = $result;

            $pre_final_array = $product['option_set']['options'];

            $pre_final_array = $pre_final_array->sortBy(function ($item) {
                return $item["pivot"]["sort_number"];
            });

            $pre_final_array = $pre_final_array->values()->all();

            $product['option_set']['options'] = $pre_final_array;
        }

        $product_two = Product::where('product_id', $request->product_id)->first();

        if (!empty($product_two)) {
            $product_two = ProductLocation::with([
                // 'location_conn.decoration_conn.charge_conn.charge_price_conn'
                'location_conn.decoration_conn'
            ])->where('product_handle', $product_two->product_handle)->get();
        }

        $records = POCSVRecord::get();

        return sendResponse(true, 'Options retrieved successfully!', $product, $product_two, $records);
    }

    public function get_logo_cash(Request $request)
    {
        $shop = User::where('name', $request->shop)->first();

        $result = collect($request->data11['items']);

        $existed_variant = $result->where('variant_id', $request->data10);
        $sum = $existed_variant->sum('quantity');
        $response_above = $shop->api()->rest('GET', '/admin/api/2023-07/variants/' . $request->data10 . '.json');
        
        if(!isset($response_above['body']['variant'])) {
            logger("JIXI: User '$shop->name' is uninstalled or needs update. Details: " . json_encode($request->all()));
            $object['data1'] = [];
            $object['data2'] = [];
            return sendResponse(true, 'Options amount recived successfully!', $object);
        }

        if ($response_above['body']['variant']['inventory_management'] == "shopify" && count($request->data8) == 0) {
            if ($request->data6 > ($response_above['body']['variant']['inventory_quantity'] - $sum) && $response_above['body']['variant']['inventory_policy'] == "deny") {
                return sendResponse(false, "Only " . $response_above['body']['variant']['inventory_quantity'] . " left in stock for variant " . $response_above['body']['variant']['title']);
            }
        }

        //GRID SIZE CHECK AND FUNCTIONALITY
        $response = $shop->api()->rest('GET', '/admin/api/2023-07/products/' . $request->data7 . '/variants.json');
        // return $response['body'];
        // return $request->data8;
        foreach ($request->data8 as $key => $my_variant) {
            if (!$my_variant['disabled'] && $my_variant['quantity'] > 0) {
                foreach ($response['body']['variants'] as $variant) {
                    if ($variant['inventory_management'] == "shopify" && $variant['inventory_policy'] == "deny"  && $variant['id'] == $my_variant['variant_id']) {
                        // dd($variant['inventory_quantity']);
                        if (!is_numeric($my_variant['quantity'])) {
                            return sendResponse(false, "[" . $my_variant['quantity'] . "] quantity can only be number.");
                        }
                        $existed_variant = $result->where('variant_id', $variant['id']);
                        $sum = $existed_variant->sum('quantity');
                        if ($my_variant['quantity'] > ($variant['inventory_quantity'] - $sum)) {
                            // dd("HELLO");
                            return sendResponse(false, "Only " . $variant['inventory_quantity'] . " left in stock for variant " . $variant['title']);
                        }
                    }
                }
                // $my_variant['quantity']
            }
        }

        $data = $request->data;
        $data2 = $request->data2;
        $data9 = $request->data9;

        $quantity = $request->data6;
        // return array($shop, $data);

        $input_field_threads = array();
        foreach ($request->data5 as $key => $value) {

            $input_field_name = $value['name'];

            $second_arr = array();
            foreach ($value['inputfields_data'] as $key2 => $value2) {
                if ($value2['input_data']) {

                    $input_no = "Line " . $key2 + 1;
                    $threads_inside = array();

                    foreach ($value2['thread'] as $key3 => $value3) {

                        $thread_id = $value3['id'];
                        $thread_name = $value3['thread_name'];

                        $thread_colors = InputFieldThread::with('thread_colors.colors')->whereHas('thread_colors', function ($q) use ($request) {
                            $q->whereHas('colors', function ($q) use ($request) {
                                $q->where('color', $request->data3);
                            });
                        })->where('id', $thread_id)->exists();

                        if ($thread_colors) {
                            $threads_inside[] =  $thread_name;
                        }
                    }

                    if (count($threads_inside) > 0) {
                        $object_inside['input_name'] = $input_no;
                        $object_inside['threads'] = implode(",", $threads_inside);
                        $second_arr[] = $object_inside;
                    } else {
                        $object_inside['input_name'] = $input_no;
                        $object_inside['threads'] = "No Threads";
                        $second_arr[] = $object_inside;
                    }
                }
            }

            $object_inside_two['input_field'] = $input_field_name;
            $object_inside_two['threads_outside'] = $second_arr;
            $input_field_threads[] = $object_inside_two;
        }

        $arr = array();
        foreach ($data as $key => $value) {

            $result = false;
            if ($value['logo_title'])
                $result = LogoGroupDetail::with('logo')->where('option_id', $value['option_id'])->whereHas('logo', function ($q) use ($value) {
                    $q->where('code_name', $value['logo_title']);
                })->first();

            if ($result) {
                $result2 = LogoChargesProduct::where('user_id', $shop->id)->where('product_price', $result->upcharge_amount)->first();
                if ($result2) {
                    $object2['id'] = $result2->variant_id;
                    $object2['quantity'] = $quantity;

                    $arr[] = $object2;
                }
            }
        }

        foreach ($data2 as $key => $value) {

            $result2 = InputFieldsProduct::where('user_id', $shop->id)->where('product_price', $value['charges'])->first();
            if ($result2) {
                $object2['id'] = $result2->variant_id;
                $object2['quantity'] = $quantity;

                $arr[] = $object2;
            }
        }

        foreach ($data9 as $key => $value) {

            $result2 = DropdownChargesProduct::where('user_id', $shop->id)->where('product_price', $value['charges'])->first();
            if ($result2) {
                $object2['id'] = $result2->variant_id;
                $object2['quantity'] = $quantity;

                $arr[] = $object2;
            }
        }

        $object['data1'] = $arr;
        $object['data2'] = $input_field_threads;

        return sendResponse(true, 'Options amount recived successfully!', $object);
    }

    public function get_font_one()
    {
        $file = public_path('fonts/arial.woff');
        $headers = [
            'Content-Type' => 'application/font-woff',
        ];
        return response()->download($file, 'arial.woff', $headers);
    }

    public function get_font_two()
    {
        $file = public_path('fonts/brush.woff');
        $headers = [
            'Content-Type' => 'application/font-woff',
        ];
        return response()->download($file, 'brush.woff', $headers);
    }

    public function sf_bold()
    {
        $file = public_path('fonts/sf_bold.woff');
        $headers = [
            'Content-Type' => 'application/font-woff',
        ];
        return response()->download($file, 'sf_bold.woff', $headers);
    }

    public function sf_medium()
    {
        $file = public_path('fonts/sf_medium.woff');
        $headers = [
            'Content-Type' => 'application/font-woff',
        ];
        return response()->download($file, 'sf_medium.woff', $headers);
    }

    public function sf_regular()
    {
        $file = public_path('fonts/sf_regular.woff');
        $headers = [
            'Content-Type' => 'application/font-woff',
        ];
        return response()->download($file, 'sf_regular.woff', $headers);
    }
}
