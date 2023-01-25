<?php

namespace App\Http\Controllers;

use App\Models\DiscountedOrder;
use App\Models\DiscountView;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    private function getChart($views, $orders, $sales)
    {
        // return array($views->get(), $orders->get());

        $views_graph = $views->selectRaw('COUNT(id) total_views, month(created_at) month')->groupBy('month')->get();

        $orders_graph = $orders->selectRaw('COUNT(id) total_orders, month(created_at) month')->groupBy('month')->get();

        $orders_amount = $sales->selectRaw('SUM(sub_total_price) sub_total_price, month(created_at) month')->groupBy('month')->get();

        // return array($views_graph,$orders_graph,$orders_amount);

        $labels = [];
        $viewsData = [];
        $ordersData = [];
        $amountData = [];

        $j = 0;
        $k = 0;
        $l = 0;

        for ($i = 1; $i <= 12; $i++) {

            $labels[] = Carbon::now()->startOfMonth()->month($i)->format('M');

            if (($views_graph[$j]['month'] ?? 0) == $i) {
                $viewsData[] = $views_graph[$j]['total_views'];
                $j++;
            } else {
                $viewsData[] = 0;
            }

            if (($orders_graph[$k]['month'] ?? 0) == $i) {
                $ordersData[] = $orders_graph[$k]['total_orders'];
                $k++;
            } else {
                $ordersData[] = 0;
            }

            if (($orders_amount[$l]['month'] ?? 0) == $i) {
                $amountData[] = $orders_amount[$l]['sub_total_price'];
                $l++;
            } else {
                $amountData[] = 0;
            }
        }

        $dataset1 = [
            'fill' => true,
            'label' => 'Views Count',
            'data' => $viewsData,
            'borderColor' => 'rgba(79, 209, 197, 1)',
            'backgroundColor' => 'rgba(79, 209, 197, 0.54)',
        ];
        $dataset2 = [
            'fill' => true,
            'label' => 'Orders Count',
            'data' => $ordersData,
            'borderColor' => 'rgba(79, 209, 197, 1)',
            'backgroundColor' => 'rgba(79, 209, 197, 0.54)',
        ];
        $dataset3 = [
            'fill' => true,
            'label' => 'Total Sales',
            'data' => $amountData,
            'borderColor' => 'rgba(79, 209, 197, 1)',
            'backgroundColor' => 'rgba(79, 209, 197, 0.54)',
        ];

        $data = [
            'labels' => $labels,
            'dataset1' => $dataset1,
            'dataset2' => $dataset2,
            'dataset3' => $dataset3,
        ];

        return $data;
    }

    public function get_dashboard_data(Request $request)
    {
        // return $request;

        $current_user = Auth::user();
        $shop = User::find($current_user->id);

        $views = DiscountView::where('user_id', $shop->id);
        $orders = DiscountedOrder::where('user_id', $shop->id);
        $sales = DiscountedOrder::where('user_id', $shop->id);

        if ($request->filter == "all") {
        } else if ($request->filter == "today") {

            $views->whereDate('created_at', Carbon::now());
            $orders->whereDate('created_at', Carbon::now());
            $sales->whereDate('created_at', Carbon::now());
        } else if ($request->filter == "yesterday") {

            $views->whereDate('created_at', '=', Carbon::yesterday());
            $orders->whereDate('created_at', '=', Carbon::yesterday());
            $sales->whereDate('created_at', '=', Carbon::yesterday());
        } else if ($request->filter == "dates") {

            $views->when($request->get('start_date') && $request->get('end_date'), function ($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->start_date)->whereDate('created_at', '<=', $request->end_date);
            });

            $orders->when($request->get('start_date') && $request->get('end_date'), function ($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->start_date)->whereDate('created_at', '<=', $request->end_date);
            });

            $sales->when($request->get('start_date') && $request->get('end_date'), function ($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->start_date)->whereDate('created_at', '<=', $request->end_date);
            });
        }

        $dashboard = [
            'views' => $views->count(),
            'orders' => $orders->count(),
            'sales' => $orders->sum('sub_total_price'),
        ];

        $data = [
            'dashboard' => $dashboard,
            'first_chart_one' => $this->getChart($views, $orders, $sales),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Dashboard data retrieved successfully!',
            'data' => $data,
        ]);
    }
}
