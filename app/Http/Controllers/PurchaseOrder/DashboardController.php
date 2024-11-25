<?php

namespace App\Http\Controllers\PurchaseOrder;

use App\Http\Controllers\Controller;
use App\Models\AllInOne\User;
use App\Models\PurchaseOrder\POOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use stdClass;

class DashboardController extends Controller
{
    public function get_dashboard_data(Request $request)
    {
        //doing some default settings

        $users = User::where('role_id', 2)->get();

        $object1 = new stdClass();
        $object1->red = 29;
        $object1->green = 122;
        $object1->blue = 18;
        $object1->alpha = 1;

        foreach ($users as $key => $value) {
            if ($value->icons_color == null) {
                $value->icons_color = json_encode($object1);
                $value->save();
            }
        }

        if (!$request->selected_store) {
            $one = count(POOrder::get());
            $two = POOrder::sum('total_price');

            $three = count(POOrder::where('purchase_status', 1)->get());
            $four = POOrder::where('purchase_status', 1)->sum('total_price');

            $five = count(POOrder::where('purchase_status', 0)->get());
            $six = POOrder::where('purchase_status', 0)->sum('total_price');
        } else {

            $keys = explode(",", $request->selected_store);

            $one = count(POOrder::whereIn('user_id', $keys)->get());
            $two = POOrder::whereIn('user_id', $keys)->sum('total_price');

            $three = count(POOrder::whereIn('user_id', $keys)->where('purchase_status', 1)->get());
            $four = POOrder::whereIn('user_id', $keys)->where('purchase_status', 1)->sum('total_price');

            $five = count(POOrder::whereIn('user_id', $keys)->where('purchase_status', 0)->get());
            $six = POOrder::whereIn('user_id', $keys)->where('purchase_status', 0)->sum('total_price');
        }

        $all_stores = User::where('role_id', 2)->get();

        return response()->json([
            'success' => true,
            'message' => 'dashboard data shown.',
            'data' => array($one, $two, $three, $four, $five, $six),
            'data2' => $all_stores
        ]);
    }

    public function merchant_view(Request $request)
    {
        $user = User::where('name', $request->selected_store)->first();

        $orders = DB::table('po_orders')
            ->where('user_id', $user->id)
            ->join('users', 'users.id', '=', 'po_orders.user_id')
            ->orderBy('po_orders.id', 'desc')
            ->select('po_orders.*', 'users.name as store_name')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Orders list shown specific store.',
            'data' => $orders,
        ]);
    }

    public function discount_settings(Request $request)
    {
        $user = User::find($request->user_id);
        $user->show_discount_field = ($request->discount_visibility === 'true');
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Discount field visibility status updated',
        ]);
    }
}
