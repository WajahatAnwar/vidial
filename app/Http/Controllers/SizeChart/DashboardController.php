<?php

namespace App\Http\Controllers\SizeChart;
use App\Http\Controllers\Controller;

use App\Models\SizeChart\SCSizeChart;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    private function getGraph($graph, $field_name)
    {
        $j = 0;
        $data = [];
        for ($i = 1; $i <= 12; $i++) {
            if (($graph[$j]['month'] ?? 0) == $i) {
                $data[] = $graph[$j][$field_name];
                $j++;
            } else {
                $data[] = 0;
            }
        }
        return $data;
    }
    public function index(Request $request)
    {
        $user = auth()->user();
        $date_callback = function ($q) {
            $q->whereDate('created_at', '>=', request()->get('start'))->whereDate('created_at', '<=', request()->get('end'));
        };
        $size_chart = SCSizeChart::query();
        $total_size_charts = $size_chart->when($request->get('start') || $request->has('end'), $date_callback)->count();
        $active_size_charts = $size_chart->clone()->when($request->get('start') || $request->has('end'), $date_callback)->where('status', 1)->count();
        $inactive_size_charts = $size_chart->clone()->when($request->get('start') || $request->has('end'), $date_callback)->where('status', 0)->count();
        $active_size_charts_graph = $size_chart->clone()->when($request->get('start') || $request->has('end'), $date_callback)->selectRaw('count(id) active_size_charts, month(created_at) month')
            ->whereYear('created_at', date('Y'))
            ->groupBy('month')
            ->get();
        $chart = $this->getGraph($active_size_charts_graph, 'active_size_charts');
        return sendResponse(
            true,
            'Dashboard data retrieved successfully!',
            compact(
                'total_size_charts',
                'active_size_charts',
                'inactive_size_charts',
                'chart'
            )
        );
    }

    public function get_shop_data(Request $request)
    {
        $user = auth()->user();
        $date_callback = function ($q) {
            $q->whereDate('created_at', '>=', request()->get('start'))->whereDate('created_at', '<=', request()->get('end'));
        };
        $size_chart = SCSizeChart::query();
        $total_size_charts = $size_chart->when($request->get('start') || $request->has('end'), $date_callback)->count();
        $active_size_charts = $size_chart->clone()->when($request->get('start') || $request->has('end'), $date_callback)->where('status', 1)->count();
        $inactive_size_charts = $size_chart->clone()->when($request->get('start') || $request->has('end'), $date_callback)->where('status', 0)->count();
        $active_size_charts_graph = $size_chart->clone()->when($request->get('start') || $request->has('end'), $date_callback)->selectRaw('count(id) active_size_charts, month(created_at) month')
            ->whereYear('created_at', date('Y'))
            ->groupBy('month')
            ->get();
        $chart = $this->getGraph($active_size_charts_graph, 'active_size_charts');
        return sendResponse(
            true,
            'Dashboard data retrieved successfully!',
            compact(
                'total_size_charts',
                'active_size_charts',
                'inactive_size_charts',
                'chart'
            )
        );
    }
}
