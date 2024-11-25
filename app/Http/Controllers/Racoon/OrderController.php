<?php

namespace App\Http\Controllers\Racoon;

use App\Http\Controllers\Controller;

use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\AllInOne\User;
use App\Models\AllInOne\Order;
use App\Traits\Racoon\RestrictionTrait;
use App\Jobs\InConnect\OrderCreateJob as InConnectOrderCreateJob;

class OrderController extends Controller
{
    use RestrictionTrait;

    public function index(Request $request)
    {
        return inertia('Applications/Racoon/Orders/Orders', [
            'filter' => $request->all(),
        ]);
    }

    public function ordersList(Request $request)
    {
        $equal = Carbon::parse($request->get('start_date'))->eq($request->get('end_date'));

        $orders = Order::with(['user'])->where('is_fraud', true)->when($request->get('q'), function ($q) use ($request) {
            $q->where(function ($q) {
                $q->whereHas('user', function ($q) {
                    $q->where('name', 'like', '%' . request()->get('q') . '%');
                })
                    ->orWhere('order_name', 'like', '%' . request()->get('q') . '%')
                    ->orWhere('email', 'like', '%' . request()->get('q') . '%')
                    ->orWhere('phone_no', 'like', '%' . request()->get('q') . '%')
                    ->orWhere('customer_name', 'like', '%' . request()->get('q') . '%')
                    ->orWhere('final_total', 'like', '%' . request()->get('q') . '%')
                    ->orWhere('payment_status', 'like', '%' . request()->get('q') . '%')
                    ->orWhere('fulfillment_status', 'like', '%' . request()->get('q') . '%');
            });
        })->when($request->get('start_date') && $request->get('end_date') && !$equal, function ($q) use ($request) {
            $q->whereDate('created_at', '>=', $request->get('start_date'))->whereDate('created_at', '<=', $request->get('end_date'));
        })->when($request->get('sort'), function ($q) use ($request) {
            $q->orderBy(...explode(' ', $request->get('sort')));
        })->when($request->get('q2'), function ($q) use ($request) {
            $q->whereIn('user_id', json_decode($request->get('q2')));
        })->when($request->get('filter'), function ($q) use ($request) {
            $decoded = json_decode($request->get('dates'));
            $q->whereDate('created_at', '>=', $decoded->start);
            $q->whereDate('created_at', '<=', $decoded->end);
        })->cursorPaginate($request->page_count);

        $users = User::whereNotNull('password')->where('role_id', 2)->orderBy('store_name', 'desc')->get();

        return responseJson(true, 'Orders retrieved successfully!', $orders, $users);
    }

    public function show(Order $order)
    {
        $user = $order->user;
        $shopifyOrder = $user->api()->rest('GET', '/admin/api/2023-10/orders/' . $order->order_id . '.json');
        $order['shopify_order'] = $shopifyOrder['body']['order'];
        return responseJson(true, 'Order retrieved successfully!', $order);
    }

    public function cancel(Request $request)
    {
        if($order = Order::find($request->order_id)){
            $this->cancelOrder($order);
            $order->on_hold = false;
            $order->cancelled_at = now();
            $order->save();
        }

        return responseJson(true, 'Order Cancelled Successfully!', $order);
    }

    public function process(Request $request)
    {
        if($order = Order::find($request->order_id)){
            $user = $order->user;
            $goosleyEnabled = false;
            $user->applications->each(function ($application) use (&$goosleyEnabled) {
                if ($application->name == 'Goosely') {
                    $goosleyEnabled = $application->pivot->status == 1 ? true : false;
                }
            });

            if(!$goosleyEnabled){
                return responseJson(false, 'Oops Goosely is disabled!', null);
            }

            if($user){
                if ($user->inconnect_account) {
                    InConnectOrderCreateJob::dispatch($user, $order->payload);
                } else {
                    logger("INCONNECT ACCOUNT DOES NOT EXIST FOR SHOP " . $user->name);
                }

                // ORDER SPLITTER SECTION
                $order_splitter = orderSplitterJob($user, $order->payload);
                // ORDER SPLITTER SECTION

                $order->on_hold = false;
                $order->save();
            }
        }

        return responseJson(true, 'Order Processed Successfully!', $order);
    }
}
