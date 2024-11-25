<?php

namespace App\Http\Controllers\PurchaseOrder;

use App\Http\Controllers\Controller;
use App\Jobs\PurchaseOrder\ApproveOrderJob;
use App\Models\AllInOne\User;
use App\Models\PurchaseOrder\POOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrdersController extends Controller
{
    public function get_orders(Request $request)
    {
        $users = User::where('role_id', 2)->orderBy('store_name', 'asc')->get();

        $orders = POOrder::with('order_user')
            ->when($request->has('status'), function ($q) use ($request) {
                $q->when($request->status == '0', function ($q) {
                    $q->where('purchase_status', false);
                });
                $q->when($request->status == '1', function ($q) {
                    $q->where('purchase_status', true);
                });
            })->when($request->get('q'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->orWhere('shopify_order_id', 'LIKE', '%' . $request->q . '%');
                    $q->orWhere('purchase_order_id', 'LIKE', '%' . $request->q . '%');
                    $q->orWhere('email', 'LIKE', '%' . $request->q . '%');
                    $q->orWhere('phone', 'LIKE', '%' . $request->q . '%');
                    $q->orWhere('name', 'LIKE', '%' . $request->q . '%');
                });
            })->when($request->get('q3'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->whereIn('user_id', json_decode($request->q3));
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
                $q->when($request->get('q5') == "email asc", function ($q) {
                    $q->orderBy("email", "asc");
                });
                $q->when($request->get('q5') == "email desc", function ($q) {
                    $q->orderBy("email", "desc");
                });
                $q->when($request->get('q5') == "phone asc", function ($q) {
                    $q->orderBy("phone", "asc");
                });
                $q->when($request->get('q5') == "phone desc", function ($q) {
                    $q->orderBy("phone", "desc");
                });
                $q->when($request->get('q5') == "purchase_order asc", function ($q) {
                    $q->orderBy("purchase_order_id", "asc");
                });
                $q->when($request->get('q5') == "purchase_order desc", function ($q) {
                    $q->orderBy("purchase_order_id", "desc");
                });
            })->cursorPaginate($request->page_count);

        return responseJson(true, 'Orders retrieved successfully!', $orders, $users);
    }

    public function approve_order(Request $request)
    {
        // return $request;

        $existing_order = POOrder::find($request->order_id);

        $current_shop = User::find($existing_order->user_id);

        $response = $current_shop->api()->rest('put', '/admin/api/2023-04/draft_orders/' . $existing_order->shopify_order_id . '/complete.json');

        // Log::info(json_encode($response));

        if ($response['errors'] == true) {
            return response()->json([
                'success' => false,
                'message' => 'Checkouts are not available for this store.',
                // 'data' => $orders,
            ]);
        }

        $existing_order->shopify_order_id = $response['body']['draft_order']['order_id'];
        $existing_order->order_no = $response['body']['draft_order']['customer']['last_order_name'];
        $existing_order->purchase_status = true;
        $existing_order->save();

        // ApproveOrderJob::dispatch(json_encode($response));
        ApproveOrderJob::dispatchSync($existing_order);

        return response()->json([
            'success' => true,
            'message' => 'Order approved.',
            // 'data' => $orders,
        ]);
    }

    public function approve_selected(Request $request)
    {
        // return $request;

        $orders_ids = json_decode($request->orders_ids);
        $search_query = json_decode($request->search_query);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;

        if ($all_check == "true") {
            parse_str($search_query, $params);

            $orders_ids = POOrder::with('order_user')
                ->when($request->has('status'), function ($q) use ($request) {
                    $q->when($request->status == '0', function ($q) {
                        $q->where('purchase_status', false);
                    });
                    $q->when($request->status == '1', function ($q) {
                        $q->where('purchase_status', true);
                    });
                })->when($request->get('q'), function ($q) use ($request) {
                    $q->where(function ($q) use ($request) {
                        $q->orWhere('shopify_order_id', 'LIKE', '%' . $request->q . '%');
                        $q->orWhere('purchase_order_id', 'LIKE', '%' . $request->q . '%');
                        $q->orWhere('email', 'LIKE', '%' . $request->q . '%');
                        $q->orWhere('phone', 'LIKE', '%' . $request->q . '%');
                        $q->orWhere('name', 'LIKE', '%' . $request->q . '%');
                    });
                })->when($request->get('q3'), function ($q) use ($request) {
                    $q->where(function ($q) use ($request) {
                        $q->whereIn('user_id', json_decode($request->q3));
                    });
                })->get()->pluck('id');
        }

        foreach ($orders_ids as $key => $value) {

            $existing_order = POOrder::find($value);

            if (!$existing_order->purchase_status) {
                $current_shop = User::find($existing_order->user_id);

                $response = $current_shop->api()->rest('put', '/admin/api/2023-04/draft_orders/' . $existing_order->shopify_order_id . '/complete.json');
                if ($response['errors'] == true) {
                    // Log::info(json_encode($response));
                    return response()->json([
                        'success' => false,
                        'message' => 'Some Errors We are facing right now for draft order.',
                        // 'data' => $orders,
                    ]);
                }

                if (isset($existing_order->order_request)) {
                    $responseTwo = $current_shop->api()->rest('get', '/admin/api/2023-07/orders/' . $response['body']['draft_order']['order_id'] . '.json');
                    if ($responseTwo['errors'] == true) {
                        // Log::info(json_encode($responseTwo));
                        return response()->json([
                            'success' => false,
                            'message' => 'Some Errors We are facing right now.',
                            // 'data' => $orders,
                        ]);
                    }
                    shipping($responseTwo['body']['order'], json_decode($existing_order->order_request));
                }


                $existing_order->shopify_order_id = $response['body']['draft_order']['order_id'];
                $existing_order->order_no = $response['body']['draft_order']['customer']['last_order_name'];
                $existing_order->purchase_status = true;
                $existing_order->save();

                ApproveOrderJob::dispatchSync($existing_order);
            }
        }

        return responseJson(true, 'Selected orders are approved.');
    }
}
