<?php

namespace App\Http\Controllers\Punchout;

use App\Http\Controllers\Controller;
use App\Models\Punchout\PomwGatewayClient;
use App\Models\Punchout\PomwGatewayClientConfirmedOrder;
use App\Models\Punchout\PomwGatewayClientCustomer;
use App\Models\Punchout\PomwGatewayClientCustomerPunchoutSession;
use App\Models\Punchout\PomwGatewayClientOrder;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function dashboard(Request $request)
    {
        $clients = PomwGatewayClient::orderBy('name', 'asc')->get();
        $orders = $this->getOrdersStats($request);
        $sessions = $this->getSessionStats($request);
        $customers = $this->getCustomerStats($request);
        $confirmOrders = $this->getConfirmOrdersStats($request);
        $analytics = $this->getOrderAnalytics($request);
        $data = [
            'orders' => [
                'count' => $orders['count'],
                'percentage' => $orders['percentage']
            ],
            'sessions' => [
                'count' => $sessions['count'],
                'percentage' => $sessions['percentage']
            ],
            'customers' => [
                'count' => $customers['count'],
                'percentage' => $customers['percentage']
            ],
            'confirm_orders' => [
                'count' => $confirmOrders['count'],
                'percentage' => $confirmOrders['percentage']
            ],
            'analytics' => $analytics,
            'clients' => $clients
        ];
        return sendResponse(true, 'Fecthed', $data);
    }
    public function getOrdersStats(Request $request)
    {

        $startDate = Carbon::parse($request->startDate);
        $endDate = Carbon::parse($request->endDate);

        $dailyOrders = PomwGatewayClientOrder::whereBetween('created_at', [$startDate, $endDate])
            ->when($request->get('clientId'), function ($query) use ($request) {
                $query->where('client_id', $request->clientId);
            })
            ->where('is_approved', 1)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->pluck('count', 'date');
        $averageCount = $dailyOrders->avg();

        // Calculate total orders and average for all time
        $totalOrders = PomwGatewayClientOrder::when($request->get('clientId'), function ($query) use ($request) {
            $query->where('client_id', $request->clientId);
        })->whereNotBetween('created_at', [$startDate, $endDate])->where('is_approved', 1)->count();
        $totalDays = PomwGatewayClientOrder::when($request->get('clientId'), function ($query) use ($request) {
            $query->where('client_id', $request->clientId);
        })->where('is_approved', 1)->whereNotBetween('created_at', [$startDate, $endDate])->selectRaw('COUNT(DISTINCT DATE(created_at)) as days')->first()->days;
        $overallAverageCount = $totalDays > 0 ? $totalOrders / $totalDays : 0;

        $percentageChange = 0;
        if ($overallAverageCount > 0) {
            $percentageChange = (($averageCount - $overallAverageCount) / $overallAverageCount) * 100;
        }
        $orders = PomwGatewayClientOrder::when($request->get('clientId'), function ($query) use ($request) {
            $query->where('client_id', $request->clientId);
        })->where('is_approved', 1)->whereBetween('created_at', [$startDate, $endDate])->count();
        return ['count' => $orders, 'percentage' => $percentageChange];
    }
    public function getSessionStats(Request $request)
    {

        $startDate = Carbon::parse($request->startDate);
        $endDate = Carbon::parse($request->endDate);

        $dailySessions = PomwGatewayClientCustomerPunchoutSession::when($request->get('clientId'), function ($query) use ($request) {
            $query->where('client_id', $request->clientId);
        })->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->pluck('count', 'date');
        $averageCount = $dailySessions->avg();

        // Calculate total orders and average for all time
        $totalSessions = PomwGatewayClientCustomerPunchoutSession::when($request->get('clientId'), function ($query) use ($request) {
            $query->where('client_id', $request->clientId);
        })->whereNotBetween('created_at', [$startDate, $endDate])->count();
        $totalDays = PomwGatewayClientCustomerPunchoutSession::when($request->get('clientId'), function ($query) use ($request) {
            $query->where('client_id', $request->clientId);
        })->whereNotBetween('created_at', [$startDate, $endDate])->selectRaw('COUNT(DISTINCT DATE(created_at)) as days')->first()->days;
        $overallAverageCount = $totalDays > 0 ? $totalSessions / $totalDays : 0;

        $percentageChange = 0;
        if ($overallAverageCount > 0) {
            $percentageChange = (($averageCount - $overallAverageCount) / $overallAverageCount) * 100;
        }
        $sessions = PomwGatewayClientCustomerPunchoutSession::when($request->get('clientId'), function ($query) use ($request) {
            $query->where('client_id', $request->clientId);
        })->whereBetween('created_at', [$startDate, $endDate])->count();
        return ['count' => $sessions, 'percentage' => $percentageChange];
    }
    public function getCustomerStats(Request $request)
    {

        $startDate = Carbon::parse($request->startDate);
        $endDate = Carbon::parse($request->endDate);

        $dailySessions = PomwGatewayClientCustomer::when($request->get('clientId'), function ($query) use ($request) {
            $query->where('client_id', $request->clientId);
        })->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->pluck('count', 'date');
        $averageCount = $dailySessions->avg();

        // Calculate total orders and average for all time
        $totalSessions = PomwGatewayClientCustomer::when($request->get('clientId'), function ($query) use ($request) {
            $query->where('client_id', $request->clientId);
        })->whereNotBetween('created_at', [$startDate, $endDate])->count();
        $totalDays = PomwGatewayClientCustomer::when($request->get('clientId'), function ($query) use ($request) {
            $query->where('client_id', $request->clientId);
        })->whereNotBetween('created_at', [$startDate, $endDate])->selectRaw('COUNT(DISTINCT DATE(created_at)) as days')->first()->days;
        $overallAverageCount = $totalDays > 0 ? $totalSessions / $totalDays : 0;

        $percentageChange = 0;
        if ($overallAverageCount > 0) {
            $percentageChange = (($averageCount - $overallAverageCount) / $overallAverageCount) * 100;
        }
        $sessions = PomwGatewayClientCustomer::when($request->get('clientId'), function ($query) use ($request) {
            $query->where('client_id', $request->clientId);
        })->whereBetween('created_at', [$startDate, $endDate])->count();
        return ['count' => $sessions, 'percentage' => $percentageChange];
    }
    public function getConfirmOrdersStats(Request $request)
    {

        $startDate = Carbon::parse($request->startDate);
        $endDate = Carbon::parse($request->endDate);

        $dailyOrders = PomwGatewayClientConfirmedOrder::when($request->get('clientId'), function ($query) use ($request) {
            $query->whereHas('order', function ($query) use ($request) {
                $query->where('client_id', $request->clientId);
            });
        })->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE(created_at) as date, SUM(total) as total_sum')
            ->groupBy('date')
            ->pluck('total_sum', 'date');
        $averageTotal = $dailyOrders->avg();
        // Calculate total orders and average for all time
        $totalOrders = PomwGatewayClientConfirmedOrder::when($request->get('clientId'), function ($query) use ($request) {
            $query->whereHas('order', function ($query) use ($request) {
                $query->where('client_id', $request->clientId);
            });
        })->whereNotBetween('created_at', [$startDate, $endDate])->sum('total');
        $totalDays = PomwGatewayClientConfirmedOrder::when($request->get('clientId'), function ($query) use ($request) {
            $query->whereHas('order', function ($query) use ($request) {
                $query->where('client_id', $request->clientId);
            });
        })->whereNotBetween('created_at', [$startDate, $endDate])->selectRaw('COUNT(DISTINCT DATE(created_at)) as days')->first()->days;
        $overallAverageCount = $totalDays > 0 ? $totalOrders / $totalDays : 0;

        $percentageChange = 0;
        if ($overallAverageCount > 0) {
            $percentageChange = (($averageTotal - $overallAverageCount) / $overallAverageCount) * 100;
        }
        $orders = PomwGatewayClientConfirmedOrder::when($request->get('clientId'), function ($query) use ($request) {
            $query->whereHas('order', function ($query) use ($request) {
                $query->where('client_id', $request->clientId);
            });
        })->whereBetween('created_at', [$startDate, $endDate])->sum('total');
        return ['count' => $orders, 'percentage' => $percentageChange];
    }
    public function getOrderAnalytics(Request $request)
    {
        $startDate = Carbon::parse($request->startDate);
        $endDate = Carbon::parse($request->endDate);

        // Create an array for the total amounts
        $totalAmounts = [];

        for ($date = $startDate; $date <= $endDate; $date->addDay()) {
            $total = intval(PomwGatewayClientConfirmedOrder::when($request->get('clientId'), function ($query) use ($request) {
                $query->whereHas('order', function ($query) use ($request) {
                    $query->where('client_id', $request->clientId);
                });
            })->whereDate('created_at', $date)->sum('total'));
            $totalAmounts[] = $total;
        }
        $startDate = Carbon::parse($request->startDate);
        $endDate = Carbon::parse($request->endDate);
        // Generate categories in the same way for consistency
        $categories = [];
        for ($date = $startDate; $date <= $endDate; $date->addDay()) {
            $categories[] = $date->format('Y-m-d');
        }

        return [
            'totalAmounts' => $totalAmounts,
            'categories' => $categories
        ];
    }
    public function dashboardOrders(Request $request)
    {
        $startDate = Carbon::parse($request->startDate);
        $endDate = Carbon::parse($request->endDate);
        $orders = PomwGatewayClientOrder::with(['pomw_client', 'pomw_customer'])
            ->limit(250)
            ->when($request->has('q'), function ($q) use ($request) {
                $q->where('uuid', 'like', '%' . $request->get('q') . '%');
            })
            ->when($request->has('sort'), function ($q) use ($request) {
                $q->orderBy(...explode(' ', $request->get('sort')));
            })
            ->when($request->get('clientId'), function ($query) use ($request) {
                $query->where('client_id', $request->clientId);
            })
            ->when($request->get('startDate'), function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            })
            ->cursorPaginate($request->page_count);
        $orders->getCollection()->transform(function ($order) {
            $clientName = $order->pomw_client->shopify_shop_url;
            $shopifyOrderId = $order->shopify_order_id;
            $storeName = explode('.', $clientName)[0];
            $order->shopify_url = "https://admin.shopify.com/store/{$storeName}/orders/{$shopifyOrderId}";
            return $order;
        });
        return sendResponse(true, 'orders retrieved successfully!', $orders);
    }
}
