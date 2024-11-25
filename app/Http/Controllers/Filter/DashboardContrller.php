<?php

namespace App\Http\Controllers\Filter;

use App\Http\Controllers\Controller;
use App\Models\Filter\Filter;
use App\Models\Filter\FilterSetFilter;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardContrller extends Controller
{
    public function get_dashboard_data(Request $request)
    {
        // return $request;

        $filters = Filter::query();
        $assigned_filters = FilterSetFilter::query();

        if ($request->filter == "all") {
        } else if ($request->filter == "today") {

            $filters->whereDate('created_at', Carbon::now());
            $assigned_filters->whereDate('created_at', Carbon::now());
        } else if ($request->filter == "yesterday") {

            $filters->whereDate('created_at', '=', Carbon::yesterday());
            $assigned_filters->whereDate('created_at', '=', Carbon::yesterday());
        } else if ($request->filter == "dates") {

            $filters->when($request->get('start_date') && $request->get('end_date'), function ($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->start_date)->whereDate('created_at', '<=', $request->end_date);
            });

            $assigned_filters->when($request->get('start_date') && $request->get('end_date'), function ($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->start_date)->whereDate('created_at', '<=', $request->end_date);
            });
        }

        $data = [
            'filters' => $filters->count(),
            'filters_applied' => $assigned_filters->count(),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Dashboard data retrieved successfully!',
            'data' => $data,
        ]);
    }
}
