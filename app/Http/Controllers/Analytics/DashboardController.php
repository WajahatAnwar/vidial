<?php

namespace App\Http\Controllers\Analytics;

use App\Exports\Analytics\SendAnalyticsExport;
use App\Http\Controllers\Controller;
use App\Mail\Analytics\SendAnalytics;
use App\Models\AllInOne\Collection;
use App\Models\AllInOne\Product;
use App\Models\AllInOne\User;
use App\Models\AllInOne\Order;
use App\Models\AllInOne\Refund;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Maatwebsite\Excel\Facades\Excel;

class DashboardController extends Controller
{
    // public function index()
    // {
    //     $user = Auth::user();
    //     if (!isset($user->store_name)) {
    //         $shopName = $user->api()->rest('GET', '/admin/api/2023-04/shop.json')['body']['shop']['name'];
    //         $shop = User::find($user->id);
    //         $shop->store_name = $shopName;
    //         $shop->save();
    //     }

    //     $check = Product::where('user_id', $user->id)->first();
    //     if (empty($check)) {
    //         sync_orders($user);
    //     }

    //     return Inertia::render('EmbeddedApp');
    // }

    public function fetchDashboardContentTwo(Request $request)
    {
        $stores = User::where('role_id', 2)->get();
        $object['stores'] = $stores;
        return responseJson(true, 'Dashboard data fetched Successfully', $object);
    }

    private function getCharts(
        $orders,
        $products,
        $collections,
        $refunds,
        $orders_three,
        $orders_four,
        $orders_five,
        $orders_six,
        $orders_eight
    ) {
        // return array($views->get(), $orders->get());

        $orders_graph = $orders->selectRaw('COUNT(id) total_orders, month(created_at) month')->groupBy('month')->lazy()->toArray();

        $products_graph = $products->selectRaw('COUNT(id) total_products, month(created_at) month')->groupBy('month')->lazy()->toArray();

        $collections_graph = $collections->selectRaw('COUNT(id) total_collections, month(created_at) month')->groupBy('month')->lazy()->toArray();

        $refunds_graph = $refunds->selectRaw('SUM(refund_amount) total_refunds, month(created_at) month')->groupBy('month')->lazy()->toArray();

        $orders_three_graph = $orders_three->selectRaw('COUNT(id) total_unshipped, MONTH(created_at) month')->whereNull('fulfillment_status')->groupBy('month')->lazy()->toArray();

        $orders_four_graph = $orders_four->selectRaw('COUNT(id) total_partial, month(created_at) month')->where('fulfillment_status', 'partial')->groupBy('month')->lazy()->toArray();

        $orders_five_graph = $orders_five->selectRaw('COUNT(id) total_fulfilled, month(created_at) month')->where('fulfillment_status', 'fulfilled')->groupBy('month')->lazy()->toArray();

        $orders_six_graph = $orders_six->selectRaw('SUM(total) all_total_price, COUNT(id) total_orders, month(created_at) month')
            ->groupBy('month')
            ->lazy()
            ->map(function ($item) {
                $item->avg_price_per_order = $item->all_total_price / $item->total_orders;
                return $item;
            })->toArray();

        $orders_eight_graph = $orders_eight->selectRaw('SUM(total) total_amount, month(created_at) month')->groupBy('month')->lazy()->toArray();

        // return array($orders_graph,$products_graph,$collections_graph);

        $labels = [];
        $ordersData = [];
        $productsData = [];
        $collectionsData = [];
        $refundsData = [];
        $ordersThreeData = [];
        $ordersFourData = [];
        $ordersFiveData = [];
        $ordersSixData = [];
        $ordersEightData = [];

        $j = 0;
        $k = 0;
        $l = 0;
        $m = 0;
        $n = 0;
        $o = 0;
        $p = 0;
        $q = 0;
        $r = 0;

        for ($i = 1; $i <= 12; $i++) {

            $labels[] = Carbon::now()->startOfMonth()->month($i)->format('M');

            if (($orders_graph[$j]['month'] ?? 0) == $i) {
                $ordersData[] = $orders_graph[$j]['total_orders'];
                $j++;
            } else {
                $ordersData[] = 0;
            }

            if (($products_graph[$k]['month'] ?? 0) == $i) {
                $productsData[] = $products_graph[$k]['total_products'];
                $k++;
            } else {
                $productsData[] = 0;
            }

            if (($collections_graph[$l]['month'] ?? 0) == $i) {
                $collectionsData[] = $collections_graph[$l]['total_collections'];
                $l++;
            } else {
                $collectionsData[] = 0;
            }

            if (($refunds_graph[$m]['month'] ?? 0) == $i) {
                $refundsData[] = $refunds_graph[$m]['total_refunds'];
                $m++;
            } else {
                $refundsData[] = 0;
            }

            if (($orders_three_graph[$n]['month'] ?? 0) == $i) {
                $ordersThreeData[] = $orders_three_graph[$n]['total_unshipped'];
                $n++;
            } else {
                $ordersThreeData[] = 0;
            }

            if (($orders_four_graph[$o]['month'] ?? 0) == $i) {
                $ordersFourData[] = $orders_four_graph[$o]['total_partial'];
                $o++;
            } else {
                $ordersFourData[] = 0;
            }

            if (($orders_five_graph[$p]['month'] ?? 0) == $i) {
                $ordersFiveData[] = $orders_five_graph[$p]['total_fulfilled'];
                $p++;
            } else {
                $ordersFiveData[] = 0;
            }

            if (($orders_six_graph[$q]['month'] ?? 0) == $i) {
                $ordersSixData[] = $orders_six_graph[$q]['avg_price_per_order'];
                $q++;
            } else {
                $ordersSixData[] = 0;
            }

            if (($orders_eight_graph[$r]['month'] ?? 0) == $i) {
                $ordersEightData[] = $orders_eight_graph[$r]['total_amount'];
                $r++;
            } else {
                $ordersEightData[] = 0;
            }
        }


        $data = [
            'dataset1' => $ordersData,
            'dataset2' => $productsData,
            'dataset3' => $collectionsData,
            'dataset4' => $refundsData,
            'dataset5' => $ordersThreeData,
            'dataset6' => $ordersFourData,
            'dataset7' => $ordersFiveData,
            'dataset8' => $ordersSixData,
            'dataset9' => $ordersEightData,
        ];

        return $data;
    }

    public function fetchDashboardContent(Request $request)
    {
        ini_set('memory_limit', -1);
        //BOSS CHECKING
        // $users = DB::connection('virtual_options_conn')->table('option_sets')
        //     ->join(DB::connection('all_in_one_conn')->raw('sbszypvdax.users'), 'znpsxzzcyr.option_sets.id', '=', DB::connection('all_in_one_conn')->raw('sbszypvdax.users.option_set_id'))
        //     ->select('option_sets.*')
        //     ->get();
        // return $users;

        //TOP STORES
        $stores = User::where('role_id', 2)
            ->leftJoin(DB::raw('(SELECT user_id, SUM(total) as total_amount FROM orders GROUP BY user_id) as order_totals'), 'users.id', '=', 'order_totals.user_id')
            ->select('users.*', 'order_totals.total_amount')
            ->orderByDesc('order_totals.total_amount');
        $stores->when(null !== $request->get('store') && count(explode(",", $request->get('store'))) > 0, function ($q) use ($request) {
            $q->whereIn('id', explode(",", $request->store));
        });

        $stores->when($request->get('filter') == "dates", function ($q) use ($request) {
            $q->whereDate('created_at', '>=', $request->start_date)->whereDate('created_at', '<=', $request->end_date);
        });
        $object['stores'] = $stores->take(3)->get();

        //TOP PRODUCTS
        $products = Product::with([
            'line_items' => function ($q) {
                $q->selectRaw('*,(order_line_items.quantity * order_line_items.price) as total_price');
            }
        ]);
        $products->when(null !== $request->get('store') && count(explode(",", $request->get('store'))) > 0, function ($q) use ($request) {
            $q->whereIn('products.user_id', explode(",", $request->store));
        });

        $products->when($request->get('filter') == "dates", function ($q) use ($request) {
            $q->whereDate('created_at', '>=', $request->start_date)->whereDate('created_at', '<=', $request->end_date);
        });
        $productsCollection = $products->lazy();


        $productsCollection = $productsCollection->map(function ($value) {
            // $value['variants_json'] = null;
            $value['total_price'] = $value['line_items']->sum('total_price');
            return $value;
        });
        $object['products'] = $productsCollection->sortByDesc('total_price')->values()->take(3);

        //TOP COLLECTIONS
        $collections = Collection::with([
            'products.line_items' => function ($q) {
                $q->selectRaw('*,(order_line_items.quantity * order_line_items.price) as total_price');
            }
        ]);
        $collections->when(null !== $request->get('store') && count(explode(",", $request->get('store'))) > 0, function ($q) use ($request) {
            $q->whereIn('collections.user_id', explode(",", $request->store));
        });
        $collections->when($request->get('filter') == "dates", function ($q) use ($request) {
            $q->whereDate('created_at', '>=', $request->start_date)->whereDate('created_at', '<=', $request->end_date);
        });
        $collections = $collections->lazy();
        $collections = $collections->map(function ($value) {
            $value['products'] = $value['products']->map(function ($value2) {
                // $value2['variants_json'] = null;
                $value2['total_quantity'] = $value2['line_items']->sum('quantity');
                return $value2;
            });
            $value['total_quantity'] = $value['products']->sum('total_quantity');
            return $value;
        });
        $object['collections'] = $collections->sortByDesc('total_quantity')->values()->take(3);

        //FIRST THREE GRAPHS
        $orders_two = Order::query();
        $orders_two->when(null !== $request->get('store') && count(explode(",", $request->get('store'))) > 0, function ($q) use ($request) {
            $q->whereIn('orders.user_id', explode(",", $request->store));
        });
        $orders_two->when($request->get('filter') == "dates", function ($q) use ($request) {
            $q->whereDate('created_at', '>=', $request->start_date)->whereDate('created_at', '<=', $request->end_date);
        });

        $products_two = Product::query();
        $products_two->when(null !== $request->get('store') && count(explode(",", $request->get('store'))) > 0, function ($q) use ($request) {
            $q->whereIn('products.user_id', explode(",", $request->store));
        });
        $products_two->when($request->get('filter') == "dates", function ($q) use ($request) {
            $q->whereDate('created_at', '>=', $request->start_date)->whereDate('created_at', '<=', $request->end_date);
        });

        $collections_two = Collection::query();
        $collections_two->when(null !== $request->get('store') && count(explode(",", $request->get('store'))) > 0, function ($q) use ($request) {
            $q->whereIn('collections.user_id', explode(",", $request->store));
        });
        $collections_two->when($request->get('filter') == "dates", function ($q) use ($request) {
            $q->whereDate('created_at', '>=', $request->start_date)->whereDate('created_at', '<=', $request->end_date);
        });

        $refunds = Refund::query();
        $refunds->when(null !== $request->get('store') && count(explode(",", $request->get('store'))) > 0, function ($q) use ($request) {
            $q->whereIn('refunds.user_id', explode(",", $request->store));
        });
        $refunds->when($request->get('filter') == "dates", function ($q) use ($request) {
            $q->whereDate('created_at', '>=', $request->start_date)->whereDate('created_at', '<=', $request->end_date);
        });

        // return $orders_two->get();
        // return $products_two->get();
        // return $collections_two->get();
        // return array($orders_two, $products_two, $collections_two);

        $orders_three = Order::query();
        $orders_three->when(null !== $request->get('store') && count(explode(",", $request->get('store'))) > 0, function ($q) use ($request) {
            $q->whereIn('orders.user_id', explode(",", $request->store));
        });
        $orders_three->when($request->get('filter') == "dates", function ($q) use ($request) {
            $q->whereDate('created_at', '>=', $request->start_date)->whereDate('created_at', '<=', $request->end_date);
        });

        $orders_four = Order::query();
        $orders_four->when(null !== $request->get('store') && count(explode(",", $request->get('store'))) > 0, function ($q) use ($request) {
            $q->whereIn('orders.user_id', explode(",", $request->store));
        });
        $orders_four->when($request->get('filter') == "dates", function ($q) use ($request) {
            $q->whereDate('created_at', '>=', $request->start_date)->whereDate('created_at', '<=', $request->end_date);
        });

        $orders_five = Order::query();
        $orders_five->when(null !== $request->get('store') && count(explode(",", $request->get('store'))) > 0, function ($q) use ($request) {
            $q->whereIn('orders.user_id', explode(",", $request->store));
        });
        $orders_five->when($request->get('filter') == "dates", function ($q) use ($request) {
            $q->whereDate('created_at', '>=', $request->start_date)->whereDate('created_at', '<=', $request->end_date);
        });

        $orders_six = Order::query();
        $orders_six->when(null !== $request->get('store') && count(explode(",", $request->get('store'))) > 0, function ($q) use ($request) {
            $q->whereIn('orders.user_id', explode(",", $request->store));
        });
        $orders_six->when($request->get('filter') == "dates", function ($q) use ($request) {
            $q->whereDate('created_at', '>=', $request->start_date)->whereDate('created_at', '<=', $request->end_date);
        });

        $orders_seven = Order::query();
        $orders_seven->when(null !== $request->get('store') && count(explode(",", $request->get('store'))) > 0, function ($q) use ($request) {
            $q->whereIn('orders.user_id', explode(",", $request->store));
        });
        $orders_seven->when($request->get('filter') == "dates", function ($q) use ($request) {
            $q->whereDate('created_at', '>=', $request->start_date)->whereDate('created_at', '<=', $request->end_date);
        });

        $orders_eight = Order::query();
        $orders_eight->when(null !== $request->get('store') && count(explode(",", $request->get('store'))) > 0, function ($q) use ($request) {
            $q->whereIn('orders.user_id', explode(",", $request->store));
        });
        $orders_eight->when($request->get('filter') == "dates", function ($q) use ($request) {
            $q->whereDate('created_at', '>=', $request->start_date)->whereDate('created_at', '<=', $request->end_date);
        });

        //SEVENTH GRAPH
        $seventh_finals = [];
        $orders_seven = $orders_seven->orderBy('total', 'DESC')->lazy()->groupBy('customer_id')->values()->take(3);
        foreach ($orders_seven as $key => $value) {
            $order_counts = array_fill(0, 12, 0);
            foreach ($value as $order) {
                $order_month = date('n', strtotime($order['order_created_at']));
                $order_counts[$order_month - 1]++;
            }
            $months = array();
            for ($i = 0; $i < 12; $i++) {
                $months[] = $order_counts[$i];
            }
            $objectInside['name'] = $value[0]['customer_name'];
            $objectInside['data'] = $months;
            array_push($seventh_finals, $objectInside);
        }
        $object['seventh_graph'] = $seventh_finals;

        //GETTING REMAINING CHARTS
        $object['three_charts_data'] = $this->getCharts(
            $orders_two,
            $products_two,
            $collections_two,
            $refunds,
            $orders_three,
            $orders_four,
            $orders_five,
            $orders_six,
            $orders_eight
        );

        return responseJson(true, 'Dashboard data fetched Successfully', $object);
    }

    public function exportTwo(Request $request)
    {
        $data = [];
        $yesterday = Carbon::yesterday()->format('Y-m-d');
        // Log::info($yesterday);
        User::where('role_id', 2)->whereNotNull('password')->get()->each(function ($user) use ($yesterday, &$data) {

            $object = [];

            $orders_count = $user->orders()->where('order_created_at', 'like', '%' . $yesterday . '%')->count();

            $object['date'] = $yesterday;
            $object['user_id'] = $user->id;
            $object['name'] = $user->store_name ? $user->store_name : $user->name;
            $object['revenue'] = (float)$user->orders()->where('order_created_at', 'like', '%' . $yesterday . '%')->sum('final_total');

            $refund_amount = 0;
            $user->orders()->where('order_created_at', 'like', '%' . $yesterday . '%')->get()->each(function ($order) use (&$refund_amount) {
                $refund_amount = $refund_amount + (float)$order->refunds()->sum('refund_amount');
            });
            $object['refund'] = $refund_amount;

            if ($orders_count > 0)
                $object['average_order_value'] = $object['revenue'] / $orders_count;
            else
                $object['average_order_value'] = 0;

            $object['orders_count'] = $orders_count;

            $object['unfulfilled_orders'] = (float)$user->orders()->where('order_created_at', 'like', '%' . $yesterday . '%')->whereNull('fulfillment_status')->count();
            $object['fulfilled_orders'] = (float)$user->orders()->where('order_created_at', 'like', '%' . $yesterday . '%')->where('fulfillment_status', 'fulfilled')->count();

            $object['unpaid_orders'] = (float)$user->orders()->where('order_created_at', 'like', '%' . $yesterday . '%')->where('payment_status', '!=', 'paid')->count();
            $object['paid_orders'] = (float)$user->orders()->where('order_created_at', 'like', '%' . $yesterday . '%')->where('payment_status', 'paid')->count();

            $customer = $user->orders()->where('order_created_at', 'like', '%' . $yesterday . '%')->orderBy('final_total', 'desc')->first();
            if ($customer)
                $object['top_customer'] = $customer->customer_name;
            else
                $object['top_customer'] = NULL;

            $products = array();
            $user->orders()->where('order_created_at', 'like', '%' . $yesterday . '%')->get()->each(function ($order) use (&$products) {
                $order->line_items->each(function ($line_item) use (&$products) {
                    $found = false;
                    foreach ($products as &$product) {
                        if ($product['product_id'] === $line_item->product_id) {
                            $product['count']++;
                            $found = true;
                            break;
                        }
                    }
                    if (!$found) {
                        array_push($products, [
                            "count" => 1,
                            "product_id" => $line_item->product_id,
                            "product_name" => $line_item->name,
                        ]);
                    }
                });
            });

            // Sort products by 'count' in descending order
            usort($products, function ($a, $b) {
                return $b['count'] - $a['count'];
            });

            if (count($products) > 0)
                $object['top_product'] = $products[0]['product_name'];
            else
                $object['top_product'] = NULL;

            $object['new_products'] = $user->products()->where('product_created_at', 'like', '%' . $yesterday . '%')->count();
            $object['new_collections'] = $user->collections()->where('collection_created_at', 'like', '%' . $yesterday . '%')->count();

            array_push($data, $object);
        });

        $fileName = 'Analytics_' . now()->format('Y-m-d_H-i-s');
        Excel::store(new SendAnalyticsExport($data), 'public/sheets/' . $fileName . '.csv');

        Mail::to("ctase@clubcolors.com")->send(new SendAnalytics($fileName));
        Mail::to("wajahat@swishtag.com")->send(new SendAnalytics($fileName));
        Mail::to("subhan@swishtag.com")->send(new SendAnalytics($fileName));
        // Mail::to("atillawall@gmail.com")->send(new SendAnalytics($fileName));
        // Mail::to("umersohail322@gmail.com")->send(new SendAnalytics($fileName));

        return sendResponse(true, 'Data Exported Successfully');
    }
}
