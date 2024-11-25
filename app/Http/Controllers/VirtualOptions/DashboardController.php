<?php

namespace App\Http\Controllers\VirtualOptions;

use App\Http\Controllers\Controller;

use App\Models\VirtualOptions\Option;
use App\Models\VirtualOptions\OptionAssignedSet;
use App\Models\AllInOne\Product;
use App\Models\AllInOne\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    private function getChart($users, $products, $options, $assigned_options)
    {
        // return array($users->get(), $products->get());

        $views_graph = $users->selectRaw('COUNT(id) total_users, month(created_at) month')->groupBy('month')->get();

        $orders_graph = $products->selectRaw('COUNT(id) total_products, month(created_at) month')->groupBy('month')->get();

        $orders_amount = $options->selectRaw('COUNT(id) total_options, month(created_at) month')->groupBy('month')->get();

        $assigned_graph = $assigned_options->selectRaw('COUNT(id) total_assigned_options, month(created_at) month')->groupBy('month')->get();

        $labels = [];
        $viewsData = [];
        $ordersData = [];
        $amountData = [];
        $assigned_options_data = [];

        $j = 0;
        $k = 0;
        $l = 0;
        $m = 0;

        for ($i = 1; $i <= 12; $i++) {

            $labels[] = Carbon::now()->startOfMonth()->month($i)->format('M');

            if (($views_graph[$j]['month'] ?? 0) == $i) {
                $viewsData[] = $views_graph[$j]['total_users'];
                $j++;
            } else {
                $viewsData[] = 0;
            }

            if (($orders_graph[$k]['month'] ?? 0) == $i) {
                $ordersData[] = $orders_graph[$k]['total_products'];
                $k++;
            } else {
                $ordersData[] = 0;
            }

            if (($orders_amount[$l]['month'] ?? 0) == $i) {
                $amountData[] = $orders_amount[$l]['total_options'];
                $l++;
            } else {
                $amountData[] = 0;
            }

            if (($assigned_graph[$m]['month'] ?? 0) == $i) {
                $assigned_options_data[] = $assigned_graph[$m]['total_assigned_options'];
                $m++;
            } else {
                $assigned_options_data[] = 0;
            }
        }

        $dataset1 = [
            'fill' => true,
            'label' => 'Stores',
            'data' => $viewsData,
            'borderColor' => 'rgba(79, 209, 197, 1)',
            'backgroundColor' => 'rgba(79, 209, 197, 0.54)',
        ];
        $dataset2 = [
            'fill' => true,
            'label' => 'Products',
            'data' => $ordersData,
            'borderColor' => 'rgba(79, 209, 197, 1)',
            'backgroundColor' => 'rgba(79, 209, 197, 0.54)',
        ];
        $dataset3 = [
            'fill' => true,
            'label' => 'Options',
            'data' => $amountData,
            'borderColor' => 'rgba(79, 209, 197, 1)',
            'backgroundColor' => 'rgba(79, 209, 197, 0.54)',
        ];
        $dataset4 = [
            'fill' => true,
            'label' => 'Options Applied',
            'data' => $assigned_options_data,
            'borderColor' => 'rgba(79, 209, 197, 1)',
            'backgroundColor' => 'rgba(79, 209, 197, 0.54)',
        ];

        $data = [
            'labels' => $labels,
            'dataset1' => $dataset1,
            'dataset2' => $dataset2,
            'dataset3' => $dataset3,
            'dataset4' => $dataset4,
        ];

        return $data;
    }

    public function get_dashboard_data(Request $request)
    {
        // return $request;

        $current_user = Auth::user();
        $shop = User::find($current_user->id);

        $users = User::where('role_id', 2);
        $products = Product::query();
        $options = Option::query();
        $assigned_options = OptionAssignedSet::query();

        if ($request->filter == "all") {
        } else if ($request->filter == "today") {

            $users->whereDate('created_at', Carbon::now());
            $products->whereDate('created_at', Carbon::now());
            $options->whereDate('created_at', Carbon::now());
            $assigned_options->whereDate('created_at', Carbon::now());
        } else if ($request->filter == "yesterday") {

            $users->whereDate('created_at', '=', Carbon::yesterday());
            $products->whereDate('created_at', '=', Carbon::yesterday());
            $options->whereDate('created_at', '=', Carbon::yesterday());
            $assigned_options->whereDate('created_at', '=', Carbon::yesterday());
        } else if ($request->filter == "dates") {

            $users->when($request->get('start_date') && $request->get('end_date'), function ($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->start_date)->whereDate('created_at', '<=', $request->end_date);
            });

            $products->when($request->get('start_date') && $request->get('end_date'), function ($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->start_date)->whereDate('created_at', '<=', $request->end_date);
            });

            $options->when($request->get('start_date') && $request->get('end_date'), function ($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->start_date)->whereDate('created_at', '<=', $request->end_date);
            });

            $assigned_options->when($request->get('start_date') && $request->get('end_date'), function ($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->start_date)->whereDate('created_at', '<=', $request->end_date);
            });
        }

        $dashboard = [
            'stores' => $users->count(),
            'products' => $products->count(),
            'virtual_options' => $options->count(),
            'options_Applied' => $assigned_options->count(),
        ];

        $data = [
            'dashboard' => $dashboard,
            'first_chart_one' => $this->getChart($users, $products, $options, $assigned_options),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Dashboard data retrieved successfully!',
            'data' => $data,
        ]);
    }
}
