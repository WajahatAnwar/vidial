<?php

namespace App\Http\Controllers\OrderSplitter;

use App\Http\Controllers\Controller;
use App\Models\AllInOne\Product;
use App\Models\AllInOne\User;
use App\Models\OrderSplitter\OSSplitOrder;
use App\Models\OrderSplitter\OSVendor;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function get_dashboard_data(Request $request)
    {

        $users = User::where('role_id', 2);
        $products = Product::query();
        $os_vendors = OSVendor::query();
        $os_orders = OSSplitOrder::query();

        if ($request->filter == "all") {
        } else if ($request->filter == "today") {

            $users->whereDate('created_at', Carbon::now());
            $products->whereDate('created_at', Carbon::now());
            $os_vendors->whereDate('created_at', Carbon::now());
            $os_orders->whereDate('created_at', Carbon::now());
        } else if ($request->filter == "yesterday") {

            $users->whereDate('created_at', '=', Carbon::yesterday());
            $products->whereDate('created_at', '=', Carbon::yesterday());
            $os_vendors->whereDate('created_at', '=', Carbon::yesterday());
            $os_orders->whereDate('created_at', '=', Carbon::yesterday());
        } else if ($request->filter == "dates") {

            $users->when($request->get('start_date') && $request->get('end_date'), function ($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->start_date)->whereDate('created_at', '<=', $request->end_date);
            });

            $products->when($request->get('start_date') && $request->get('end_date'), function ($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->start_date)->whereDate('created_at', '<=', $request->end_date);
            });

            $os_vendors->when($request->get('start_date') && $request->get('end_date'), function ($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->start_date)->whereDate('created_at', '<=', $request->end_date);
            });

            $os_orders->when($request->get('start_date') && $request->get('end_date'), function ($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->start_date)->whereDate('created_at', '<=', $request->end_date);
            });
        }

        $dashboard = [
            'users' => $users->count(),
            'products' => $products->count(),
            'os_vendors' => $os_vendors->count(),
            'os_orders' => $os_orders->count(),
        ];

        $data = [
            'dashboard' => $dashboard,
        ];

        return response()->json([
            'success' => true,
            'message' => 'Dashboard data retrieved successfully!',
            'data' => $data,
        ]);
    }
}
