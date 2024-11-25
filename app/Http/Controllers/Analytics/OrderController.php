<?php

namespace App\Http\Controllers\Analytics;

use App\Exports\Analytics\OrderExport;
use App\Http\Controllers\Controller;
use App\Models\AllInOne\Collection;
use App\Models\AllInOne\Product;
use App\Models\AllInOne\User;
use App\Models\AllInOne\Order;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class OrderController extends Controller
{
    public function ordersList(Request $request)
    {
        $products = Order::with(['user'])
            ->when($request->has('status'), function ($q) use ($request) {
                $q->when($request->status == '0', function ($q) {
                    $q->whereNot('payment_status', "paid");
                });
                $q->when($request->status == '1', function ($q) {
                    $q->where('payment_status', "paid");
                });
            })->when($request->get('q'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->orWhere('order_id', 'LIKE', '%' . $request->q . '%')
                        ->orWhere('contact_email', 'LIKE', '%' . $request->q . '%')
                        ->orWhere('customer_name', 'LIKE', '%' . $request->q . '%')
                        ->orWhere('order_name', 'LIKE', '%' . $request->q . '%')
                        ->orWhere('phone_no', 'LIKE', '%' . $request->q . '%');
                });
            })->when($request->get('q3'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->whereIn('user_id', json_decode($request->q3));
                });
            })->when($request->get('q4'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->orWhere('order_id', 'LIKE', '%' . $request->q4 . '%')
                        ->orWhere('contact_email', 'LIKE', '%' . $request->q4 . '%')
                        ->orWhere('customer_name', 'LIKE', '%' . $request->q4 . '%')
                        ->orWhere('order_name', 'LIKE', '%' . $request->q4 . '%')
                        ->orWhere('phone_no', 'LIKE', '%' . $request->q4 . '%');
                });
            })->when($request->get('q5'), function ($q) use ($request) {
                $q->when($request->get('q5') == "id asc", function ($q) {
                    $q->orderBy("id", "asc");
                });
                $q->when($request->get('q5') == "id desc", function ($q) {
                    $q->orderBy("id", "desc");
                });
                $q->when($request->get('q5') == "order asc", function ($q) {
                    $q->orderBy("order_id", "asc");
                });
                $q->when($request->get('q5') == "order desc", function ($q) {
                    $q->orderBy("order_id", "desc");
                });
                $q->when($request->get('q5') == "total asc", function ($q) {
                    $q->orderBy("total", "asc");
                });
                $q->when($request->get('q5') == "total desc", function ($q) {
                    $q->orderBy("total", "desc");
                });
                $q->when($request->get('q5') == "date asc", function ($q) {
                    $q->orderBy("order_created_at", "asc");
                });
                $q->when($request->get('q5') == "date desc", function ($q) {
                    $q->orderBy("order_created_at", "desc");
                });
            })
            // ->when($request->get('q4'), function ($q) use ($request) {
            //     $q->whereHasIn('collections', function ($q) use ($request) {
            //         $q->whereIn('collections.collection_id', json_decode($request->q4));
            //     });
            // })->when($request->get('q5'), function ($q) use ($request) {
            //     $q->where('product_vendor', json_decode($request->q5));
            // })
            ->cursorPaginate($request->page_count);

        return responseJson(true, 'Orders retrieved successfully!', $products);
    }

    public function ordersFilters(Request $request)
    {
        $users = User::where('role_id', 2)->get();

        $collections = [];
        $vendors = [];
        if ($request->user_id) {
            $collections = Collection::when($request->get('user_id'), function ($q) use ($request) {
                $q->where('user_id', $request->user_id);
            })->get();
            $vendors = Product::when($request->get('user_id'), function ($q) use ($request) {
                $q->where('user_id', $request->user_id);
            })->select('product_vendor')->distinct()->get();
        }

        $object['users'] = $users;
        $object['collections'] = $collections;
        $object['vendors'] = $vendors;

        return responseJson(true, 'Filters recieved', $object);
    }

    public function exportOrders(Request $request)
    {
        $Order_ids = explode(",", $request->order_ids);
        return Excel::download(new OrderExport($Order_ids), 'Orders.csv');
    }

    //THIS
    public function exportOrdersRefine(Request $request)
    {
        $orders_ids = json_decode($request->orders_ids);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;

        // return $request;

        if ($all_check == "true") {
            parse_str($search_query, $params);

            $orders_ids = Order::with(['user'])->when(isset($params['q']), function ($q) use ($params) {
                $q->where(function ($q) use ($params) {
                    $q->orWhere('order_id', 'LIKE', '%' . $params['q'] . '%')
                        ->orWhere('contact_email', 'LIKE', '%' . $params['q'] . '%')
                        ->orWhere('customer_name', 'LIKE', '%' . $params['q'] . '%')
                        ->orWhere('order_name', 'LIKE', '%' . $params['q'] . '%')
                        ->orWhere('phone_no', 'LIKE', '%' . $params['q'] . '%');
                });
            })->when(isset($params['q3']), function ($q) use ($params) {
                $q->where(function ($q) use ($params) {
                    $q->whereIn('user_id', json_decode($params['q3']));
                });
            })->when(isset($params['q4']), function ($q) use ($params) {
                $q->where(function ($q) use ($params) {
                    $q->orWhere('order_id', 'LIKE', '%' . $params['q4'] . '%')
                        ->orWhere('contact_email', 'LIKE', '%' . $params['q4'] . '%')
                        ->orWhere('customer_name', 'LIKE', '%' . $params['q4'] . '%')
                        ->orWhere('order_name', 'LIKE', '%' . $params['q4'] . '%')
                        ->orWhere('phone_no', 'LIKE', '%' . $params['q4'] . '%');
                });
            })->get()->pluck('id');
        }

        return responseJson(true, 'Refine Export Orders', $orders_ids);
    }
}
