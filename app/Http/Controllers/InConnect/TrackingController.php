<?php

namespace App\Http\Controllers\InConnect;

use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\AllInOne\User;
use App\Models\InConnect\Vendor;
use Illuminate\Support\Facades\DB;
use App\Models\InConnect\Decorator;
use App\Http\Controllers\Controller;
use App\Models\InConnect\InconnectOrder;
use App\Models\InConnect\VendorPurchaseOrder;
use Illuminate\Support\Facades\Session;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\InConnect\TrackingOrderExport;
use App\Exports\InConnect\FailedOrderExport;



class TrackingController extends Controller
{
    public function index(Request $request)
    {
        return inertia('Applications/InConnect/Trackings/Trackings');
    }

    public function ordersList(Request $request)
    {
        $orders =  VendorPurchaseOrder::with(['inconnectOrder.decorator', 'vendor', 'inconnectOrder.user'])
            ->when($request->get('q'), function ($q) use ($request) {
                $q->where(function ($q) {
                    $q->whereHas('inconnectOrder.user', function ($q) {
                        $q->where('name', 'like', '%' . request()->get('q') . '%');
                    })->orWhere('purchase_order_no', 'like', '%' . request()->get('q') . '%')
                        ->orWhere('intact_po_number', 'like', '%' . request()->get('q') . '%')
                        ->orWhere('tracking_number', 'like', '%' . request()->get('q') . '%')
                        ->orWhere('ship_dates', 'like', '%' . request()->get('q') . '%')
                        ->orWhereHas('vendor', function ($q) {
                            $q->where('name', 'like', '%' . request()->get('q') . '%');
                        })->orWhereHas('inconnectOrder.decorator', function ($q) {
                            $q->where('name', 'like', '%' . request()->get('q') . '%');
                        });
                });
            })
            ->when($request->get('sort'), function ($q) use ($request) {
                $q->orderBy(...explode(' ', $request->get('sort')));
            })->when($request->get('q2'), function ($q) use ($request) {
                $q->whereHas('inconnectOrder.user', function ($q) use ($request) {
                    $q->whereIn('user_id', json_decode($request->get('q2')));
                });
            })->when($request->get('decorators'), function ($q) use ($request) {
                $q->whereHas('inconnectOrder', function ($q) use ($request) {
                    $q->whereIn('decorator_id', json_decode($request->get('decorators')));
                });
            })->when($request->get('vendors'), function ($q) use ($request) {
                $q->whereIn('vendor_id', json_decode($request->get('vendors')));
            })->when($request->get('filter'), function ($q) use ($request) {
                $decoded = json_decode($request->get('dates'));
                $q->whereDate('created_at', '>=', $decoded->start);
                $q->whereDate('created_at', '<=', $decoded->end);
            })
            ->cursorPaginate($request->page_count);
      
        $users = User::whereNotNull('password')->where('role_id', 2)->orderBy('store_name', 'desc')->get();
        $decorators = Decorator::get();
        $data['users'] = $users;
        $data['decorators'] = $decorators;
        $data['vendors'] = Vendor::get();
        return responseJson(true, 'Orders retrieved successfully!', $orders, $data);
    }

    public function export(Request $request)
    {
        $orders_ids = json_decode($request->orders_ids);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;
        parse_str($search_query, $params);
        if ($all_check == "true") {
            $orders_ids =  VendorPurchaseOrder::with(['inconnectOrder.decorator', 'vendor', 'inconnectOrder.user'])
                ->when(@$params['q'], function ($q) use ($params) {
                    $q->where(function ($q) use($params) {
                        $q->whereHas('inconnectOrder.user', function ($q) use ($params) {
                            $q->where('name', 'like', '%' . $params['q'] . '%');
                        })->orWhere('purchase_order_no', 'like', '%' . $params['q'] . '%')
                            ->orWhere('intact_po_number', 'like', '%' . $params['q'] . '%')
                            ->orWhere('tracking_number', 'like', '%' . $params['q'] . '%')
                            ->orWhere('ship_dates', 'like', '%' . $params['q'] . '%')
                            ->orWhereHas('vendor', function ($q) use ($params) {
                                $q->where('name', 'like', '%' . $params['q'] . '%');
                            })->orWhereHas('inconnectOrder.decorator', function ($q) use ($params) {
                                $q->where('name', 'like', '%' . $params['q'] . '%');
                            });
                    });
                })
                ->when(@$params['sort'], function ($q) use ($params) {
                    $q->orderBy(...explode(' ', $params['sort']));
                })->when(@$params['q2'], function ($q) use ($params) {
                    $q->whereHas('inconnectOrder.user', function ($q) use ($params) {
                        $q->whereIn('user_id', json_decode($params['q2']));
                    });
                })->when(@$params['decorators'], function ($q) use ($params) {
                    $q->whereHas('inconnectOrder', function ($q) use ($params) {
                        $q->whereIn('decorator_id', json_decode($params['decorators']));
                    });
                })->when(@$params['vendors'], function ($q) use ($params) {
                    $q->whereIn('vendor_id', json_decode($params['vendors']));
                })->when(@$params['filter'], function ($q) use ($params) {
                    $decoded = json_decode($params['dates']);
                    $q->whereDate('created_at', '>=', $decoded->start);
                    $q->whereDate('created_at', '<=', $decoded->end);
                })
                ->get()->pluck('id');
        }
        $tracking = null;
        if (isset($request->tracking)) {
            $tracking = true;
        }
        
        Session::put('orders_ids', json_encode($orders_ids));
        Session::put('tracking', $tracking);
        return responseJson(true, 'Export Orders', $orders_ids);
    }

    public function download(Request $request)
    {
        // $order_ids = explode(",", $request->order_ids);
        $order_ids = json_decode(Session::get('orders_ids'));
        $tracking = Session::get('tracking');
        $export_base = Session::get('export_base');
        Session::forget('orders_ids');
        Session::forget('tracking');
        return Excel::download(new TrackingOrderExport($order_ids, true, $export_base), 'Tracking.csv');
    }
}
