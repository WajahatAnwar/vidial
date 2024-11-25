<?php

namespace App\Http\Controllers\InConnect;

use Carbon\Carbon;

use Illuminate\Http\Request;
use App\Models\AllInOne\User;
use App\Models\AllInOne\Order;
use App\Models\InConnect\Vendor;
use Illuminate\Support\Facades\DB;
use App\Models\InConnect\Decorator;
use App\Traits\InConnect\IdexTrait;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;
use App\Traits\InConnect\VendorTrait;
use App\Exports\InConnect\OrderExport;
use App\Exports\InConnect\FailedOrderExport;
use App\Jobs\InConnect\OrderCreateJob;
use App\Jobs\InConnect\VendorOrderJob;
use App\Models\AllInOne\OrderLineItem;
use Illuminate\Support\Facades\Session;
use App\Traits\Racoon\RestrictionTrait;
use App\Models\InConnect\InconnectOrder;
use App\Jobs\InConnect\IntacctSalesOrderJob;
use App\Models\InConnect\ShopifyVendorVendor;
use App\Jobs\InConnect\IntacctVendorInvoiceJob;
use App\Traits\GeneralTrait;

class OrderController extends Controller
{
    use IdexTrait, VendorTrait, RestrictionTrait, GeneralTrait;

    //CONTENT FROM ORDERS CREATE JOB
    public function realOrdersCreateJob($user, $payload)
    {
        $this->updateOrderEntry($payload->name, $user->id, 'realOrdersCreateJob');

        $order = Order::updateOrCreate(
            [
                'order_id' => $payload->id,
            ],
            [
                'order_name' => $payload->name,
                'customer_id' => isset($payload->customer) ? $payload->customer->id : NULL,
                'user_id' => $user->id,
                'email' => $payload->email,
                'contact_email' => $payload->contact_email,
                'phone_no' => $payload->phone,
                'order_created_at' => $payload->created_at,
                'customer_name' => isset($payload->customer) ? $payload->customer->first_name . " " . $payload->customer->last_name : NULL,
                'total' => $payload->subtotal_price,
                'final_total' => $payload->total_price,
                'payment_status' => $payload->financial_status,
                'fulfillment_status' => $payload->fulfillment_status,
                'payload' => $payload
            ]
        );

        if (isset($payload->line_items)) {
            foreach ($payload->line_items as $key9 => $line_item) {

                OrderLineItem::updateOrCreate(
                    [
                        'line_item_id' => $line_item->id,
                    ],
                    [
                        'user_id' => $user->id,
                        'local_order_id' => $order->id,
                        'order_id' => $payload->id,
                        'product_id' => $line_item->product_id,
                        'name' => $line_item->name,
                        'price' => $line_item->price,
                        'quantity' => $line_item->quantity,
                        'weight' => $line_item->grams,
                    ]
                );
            }
        }

        $filteredObjects = $user->applications->where('id', 8);
        $filteredObjects = $filteredObjects->first();
        // Log::info("RACOON WORKING AND STATUS IS " . json_encode($filteredObjects->pivot->status) . " FOR SHOP: " . $user->name);
        if ($filteredObjects->pivot->status) {
            if ($user->restrictions()->exists()) {

                if ($this->checkIfFraud($user, $payload, $order)) {
                    return false;
                }
            }
        }

        if ($user->inconnect_account) {
            $filteredObjects = $user->applications->where('id', 6);
            $filteredObjects = $filteredObjects->first();
            // Log::info("GOOSELY WORKING AND STATUS IS " . json_encode($filteredObjects->pivot->status) . " FOR SHOP: " . $user->name);
            if ($filteredObjects->pivot->status)
                OrderCreateJob::dispatch($user, $payload);
        } else {
            // Log::info('Goosely Account not found for Shop: ' . $user->name);
        }

        // ORDER SPLITTER SECTION
        $order_splitter = orderSplitterJob($user, $payload);
        // ORDER SPLITTER SECTION

        // Log::info(json_encode($order));

        return true;
    }

    public function index(Request $request)
    {
        return inertia('Applications/InConnect/Orders/Orders', [
            'filter' => $request->all(),
        ]);
    }

    public function ordersList(Request $request)
    {
        $callback = function ($query) use ($request) {
            $table_name = $query->getModel()->getTable();
            $equal = Carbon::parse($request->get('start_date'))->eq($request->get('end_date'));
            if ($request->get('start_date') && $request->get('end_date') && !$equal) {
                $query->whereDate($table_name . '.created_at', '>=', $request->get('start_date'))->whereDate($table_name . '.created_at', '<=', $request->get('end_date'));
            }

            if ($request->get('user_id') && $query->from != DB::connection('all_in_one_conn')->getDatabaseName() . '.users') {
                $query->where('user_id', $request->get('user_id'));
            }
        };

        $orders = InconnectOrder::with(['user.inconnect_account.fraud_statuses', 'manual_user', 'vendor', 'decorator', 'updates', 'vendorPurchaseOrders.vendor', 'batchedOrder.batch.batchSetting'])->when($request->get('q'), function ($q) use ($request) {
            $q->where(function ($q) {
                $q->whereHas('user', function ($q) {
                    $q->where('name', 'like', '%' . request()->get('q') . '%');
                })->orWhere('shopify_customer_name', 'like', '%' . request()->get('q') . '%')
                    ->orWhere('shopify_order_no', 'like', '%' . request()->get('q') . '%')
                    ->orWhere('shopify_order_name', 'like', '%' . request()->get('q') . '%')
                    ->orWhereHas('vendorPurchaseOrders', function ($q) {
                        $q->whereHas('vendor', function ($q) {
                            $q->where('name', 'like', '%' . request()->get('q') . '%');
                        });
                    })
                    ->orWhere('vendor_order_id', 'like', '%' . request()->get('q') . '%')
                    ->orWhere('vendor_intacct_order_id', 'like', '%' . request()->get('q') . '%')
                    ->orWhereHas('decorator', function ($q) {
                        $q->where('name', 'like', '%' . request()->get('q') . '%');
                    })
                    ->orWhere('decorator_order_id', 'like', '%' . request()->get('q') . '%')
                    ->orWhere('decorator_intacct_order_id', 'like', '%' . request()->get('q') . '%');
            });
        })
            ->when($request->get('sort'), function ($q) use ($request) {
                $q->orderBy(...explode(' ', $request->get('sort')));
            })->when($request->get('q2'), function ($q) use ($request) {
                $q->whereIn('user_id', json_decode($request->get('q2')));
            })->when($request->get('on_hold'), function ($q) use ($request) {
                $q->where('fraud_status', "FRAUD");
            })->when($request->get('on_hold'), $callback)
            //ST-36
            ->when($request->get('unsynced_orders'), function ($q) use ($request) {
                $q->whereDate('created_at', '<=', now()->subDays(15))
                    ->where(function ($q) {
                        $q->orWhereNull(['decorator_order_id', 'decorator_intacct_order_id']);
                    })->whereHas('vendorPurchaseOrders', function ($q) {
                        $q->where(function ($q) {
                            $q->orWhereNull(['po_number', 'intact_po_number']);
                        });
                    });
                if ($request->get('unsynced_orders') == "vip")
                    $q->where('is_vip', true);
                else if ($request->get('unsynced_orders') == "standard")
                    $q->where('is_vip', false);
                else if ($request->get('unsynced_orders') == "vip_intact") {
                    $q->where('is_vip', true);
                    $q->where(function ($q) {
                        $q->orWhereNull('decorator_intacct_order_id');
                    })->whereHas('vendorPurchaseOrders', function ($q) {
                        $q->whereNotNull('intact_po_number');
                    });
                } else if ($request->get('unsynced_orders') == "standard_intact") {
                    $q->where('is_vip', false);
                    $q->where(function ($q) {
                        $q->orWhereNull('decorator_intacct_order_id');
                    })->whereHas('vendorPurchaseOrders', function ($q) {
                        $q->whereNotNull('intact_po_number');
                    });
                }
            })->when($request->get('unsynced_orders'), $callback)
            ->when($request->get('filter'), function ($q) use ($request) {
                $decoded = json_decode($request->get('dates'));
                $q->whereDate('created_at', '>=', $decoded->start);
                $q->whereDate('created_at', '<=', $decoded->end);
            })->when($request->get('vendor_id') || $request->get('decorator_id'), $callback)
            ->when($request->get('type') == "vendor" && $request->get('vendor_id'), function ($q) use ($request) {
                $q->whereHas('updates', function ($q) use ($request) {
                    $vendor = Vendor::find($request->get('vendor_id'));
                    $q->when($request->get('status') == "success", function ($q) use ($vendor) {
                        $q->whereIn('type', ['sent_to_vendor', 'sent_to_intacct_for_vendor'])->where('name', 'LIKE', '%' . $vendor->name)->whereNull('failed_at')->whereNotNull('completed_at');
                    });
                    $q->when($request->get('status') == "failed", function ($q) use ($vendor) {
                        $q->whereIn('type', ['sent_to_vendor', 'sent_to_intacct_for_vendor'])->where('name', 'LIKE', '%' . $vendor->name)->whereNull('completed_at')->whereNotNull('failed_at');
                    });
                });
            })
            ->when($request->get('type') == "decorator" && $request->get('decorator_id'), function ($q) use ($request) {
                $q->whereHas('updates', function ($q) use ($request) {
                    $decorator = Decorator::find($request->get('decorator_id'));
                    $q->when($request->get('status') == "success", function ($q) use ($decorator) {
                        $q->whereIn('type', ['sent_to_decorator', 'sent_to_intacct_for_decorator'])->where('name', 'LIKE', '%' . $decorator->name)->whereNull('failed_at')->whereNotNull('completed_at');
                    });
                    $q->when($request->get('status') == "failed", function ($q) use ($decorator) {
                        $q->whereIn('type', ['sent_to_decorator', 'sent_to_intacct_for_decorator'])->where('name', 'LIKE', '%' . $decorator->name)->whereNull('completed_at')->whereNotNull('failed_at');
                    });
                });
            })
            ->when($request->get('order_status_type'), function ($q) use ($request) {
                $q->whereHas('updates', function ($q) use ($request) {
                    $q->where('type', $request->get('order_status_type'))->whereNull('completed_at');
                });
            })->when($request->get('type') == "zero", function ($q) use ($request) {
                $q->whereHas('vendorPrices', function ($query) {
                    $query->where('price', 0);
                });
            })->cursorPaginate($request->page_count);

        $users = User::whereNotNull('password')->where('role_id', 2)->orderBy('store_name', 'desc')->get();

        return responseJson(true, 'Orders retrieved successfully!', $orders, $users);
    }

    public function download(Request $request)
    {
        // $order_ids = explode(",", $request->order_ids);
        $order_ids = json_decode(Session::get('orders_ids'));
        $order_status_type = Session::get('order_status_type');
        $tracking = Session::get('tracking');
        $export_base = Session::get('export_base');
        Session::forget('orders_ids');
        Session::forget('order_status_type');
        Session::forget('tracking');
        Session::forget('export_base');
        if ($order_status_type) {
            return Excel::download(new FailedOrderExport($order_ids), 'failed_order.csv');
        }
        if ($tracking) {
            return Excel::download(new OrderExport($order_ids, true, $export_base), 'Tracking.csv');
        }
        return Excel::download(new OrderExport($order_ids), 'Orders.csv');
    }

    public function export(Request $request)
    {
        // Sessoion::queue(Cookie::forget('orders_ids'));

        $callback = function ($query) use ($request) {
            $table_name = $query->getModel()->getTable();
            $equal = Carbon::parse($request->get('start_date'))->eq($request->get('end_date'));
            if ($request->get('start_date') && $request->get('end_date') && !$equal) {
                $query->whereDate($table_name . '.created_at', '>=', $request->get('start_date'))->whereDate($table_name . '.created_at', '<=', $request->get('end_date'));
            }

            if ($request->get('user_id') && $query->from != DB::connection('all_in_one_conn')->getDatabaseName() . '.users') {
                $query->where('user_id', $request->get('user_id'));
            }
        };

        $export_base = "vendor_purchase_order";
        $orders_ids = json_decode($request->orders_ids);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;
        parse_str($search_query, $params);
        if ($all_check == "true") {
            $export_base = "inconnect_order";

            $orders_ids = InconnectOrder::with(['user.inconnect_account.fraud_statuses', 'manual_user', 'vendor', 'decorator', 'updates', 'vendorPurchaseOrders.vendor'])->when(isset($params['q']), function ($q) use ($params) {
                $q->where(function ($q) use ($params) {
                    $q->whereHas('user', function ($q) use ($params) {
                        $q->where('name', 'like', '%' . $params['q'] . '%');
                    })->orWhere('shopify_customer_name', 'like', '%' . $params['q'] . '%')
                        ->orWhere('shopify_order_no', 'like', '%' . $params['q'] . '%')
                        ->orWhere('shopify_order_name', 'like', '%' . $params['q'] . '%')
                        ->orWhereHas('vendorPurchaseOrders', function ($q) use ($params) {
                            $q->whereHas('vendor', function ($q) use ($params) {
                                $q->where('name', 'like', '%' . $params['q'] . '%');
                            });
                        })
                        ->orWhere('vendor_order_id', 'like', '%' . $params['q'] . '%')
                        ->orWhere('vendor_intacct_order_id', 'like', '%' . $params['q'] . '%')
                        ->orWhereHas('decorator', function ($q) use ($params) {
                            $q->where('name', 'like', '%' . $params['q'] . '%');
                        })
                        ->orWhere('decorator_order_id', 'like', '%' . $params['q'] . '%')
                        ->orWhere('decorator_intacct_order_id', 'like', '%' . $params['q'] . '%');
                });
            })
                ->when(isset($params['sort']), function ($q) use ($params) {
                    $q->orderBy(...explode(' ', $params['sort']));
                })->when(isset($params['q2']), function ($q) use ($params) {
                    $q->whereIn('user_id', json_decode($params['q2']));
                })->when(isset($params['on_hold']), function ($q) use ($params) {
                    $q->where('fraud_status', "FRAUD");
                })->when(isset($params['on_hold']), $callback)
                //ST-36
                ->when(isset($params['unsynced_orders']), function ($q) use ($params) {
                    $q->whereDate('created_at', '<=', now()->subDays(15))
                        ->where(function ($q) {
                            $q->orWhereNull(['decorator_order_id', 'decorator_intacct_order_id']);
                        })->whereHas('vendorPurchaseOrders', function ($q) {
                            $q->where(function ($q) {
                                $q->orWhereNull(['po_number', 'intact_po_number']);
                            });
                        });
                    if ($params['unsynced_orders'] == "vip")
                        $q->where('is_vip', true);
                    else if ($params['unsynced_orders'] == "standard")
                        $q->where('is_vip', false);
                    else if ($params['unsynced_orders'] == "vip_intact") {
                        $q->where('is_vip', true);
                        $q->where(function ($q) {
                            $q->orWhereNull('decorator_intacct_order_id');
                        })->whereHas('vendorPurchaseOrders', function ($q) {
                            $q->whereNotNull('intact_po_number');
                        });
                    } else if ($params['unsynced_orders'] == "standard_intact") {
                        $q->where('is_vip', false);
                        $q->where(function ($q) {
                            $q->orWhereNull('decorator_intacct_order_id');
                        })->whereHas('vendorPurchaseOrders', function ($q) {
                            $q->whereNotNull('intact_po_number');
                        });
                    }
                })->when(isset($params['unsynced_orders']), $callback)
                ->when(isset($params['filter']), function ($q) use ($params) {
                    $decoded = json_decode($params['dates']);
                    $q->whereDate('created_at', '>=', $decoded->start);
                    $q->whereDate('created_at', '<=', $decoded->end);
                })->when(isset($params['vendor_id']) || isset($params['decorator_id']), $callback)
                ->when(@$params['type'] == "vendor" && $params['vendor_id'], function ($q) use ($params) {
                    $q->whereHas('updates', function ($q) use ($params) {
                        $vendor = Vendor::find($params['vendor_id']);
                        $q->when($params['status'] == "success", function ($q) use ($vendor) {
                            $q->whereIn('type', ['sent_to_vendor', 'sent_to_intacct_for_vendor'])->where('name', 'LIKE', '%' . $vendor->name)->whereNull('failed_at')->whereNotNull('completed_at');
                        });
                        $q->when($params['status'] == "failed", function ($q) use ($vendor) {
                            $q->whereIn('type', ['sent_to_vendor', 'sent_to_intacct_for_vendor'])->where('name', 'LIKE', '%' . $vendor->name)->whereNull('completed_at')->whereNotNull('failed_at');
                        });
                    });
                })
                ->when(@$params['type'] == "decorator" && $params['decorator_id'], function ($q) use ($params) {
                    $q->whereHas('updates', function ($q) use ($params) {
                        $decorator = Decorator::find($params['decorator_id']);
                        $q->when($params['status'] == "success", function ($q) use ($decorator) {
                            $q->whereIn('type', ['sent_to_decorator', 'sent_to_intacct_for_decorator'])->where('name', 'LIKE', '%' . $decorator->name)->whereNull('failed_at')->whereNotNull('completed_at');
                        });
                        $q->when($params['status'] == "failed", function ($q) use ($decorator) {
                            $q->whereIn('type', ['sent_to_decorator', 'sent_to_intacct_for_decorator'])->where('name', 'LIKE', '%' . $decorator->name)->whereNull('completed_at')->whereNotNull('failed_at');
                        });
                    });
                })
                ->when(isset($params['order_status_type']), function ($q) use ($params) {
                    $q->whereHas('updates', function ($q) use ($params) {
                        $q->where('type', $params['order_status_type'])->whereNull('completed_at');
                    });
                })->when(isset($params['type']) && $params['type'] == "zero", function ($q) use ($params) {
                    $q->whereHas('vendorPrices', function ($query) {
                        $query->where('price', 0);
                    });
                })->get()->pluck('id');
        }

        $orderStatusType = null;
        $tracking = null;
        if (isset($params['order_status_type'])) {
            $orderStatusType = $params['order_status_type'];
        }
        if (isset($request->tracking)) {
            $tracking = true;
        }

        Session::put('export_base', $export_base);
        Session::put('orders_ids', json_encode($orders_ids));
        Session::put('order_status_type', $orderStatusType);
        Session::put('tracking', $tracking);
        return responseJson(true, 'Export Orders', $orders_ids);
    }

    public function archive(Request $request)
    {
        $callback = function ($query) use ($request) {
            $table_name = $query->getModel()->getTable();
            $equal = Carbon::parse($request->get('start_date'))->eq($request->get('end_date'));
            if ($request->get('start_date') && $request->get('end_date') && !$equal) {
                $query->whereDate($table_name . '.created_at', '>=', $request->get('start_date'))->whereDate($table_name . '.created_at', '<=', $request->get('end_date'));
            }

            if ($request->get('user_id') && $query->from != DB::connection('all_in_one_conn')->getDatabaseName() . '.users') {
                $query->where('user_id', $request->get('user_id'));
            }
        };

        $orders_ids = json_decode($request->orders_ids);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;
        parse_str($search_query, $params);
        if ($all_check == "true") {

            $orders_ids = InconnectOrder::with(['user.inconnect_account.fraud_statuses', 'manual_user', 'vendor', 'decorator', 'updates', 'vendorPurchaseOrders.vendor'])->when(isset($params['q']), function ($q) use ($params) {
                $q->where(function ($q) use ($params) {
                    $q->whereHas('user', function ($q) use ($params) {
                        $q->where('name', 'like', '%' . $params['q'] . '%');
                    })->orWhere('shopify_customer_name', 'like', '%' . $params['q'] . '%')
                        ->orWhere('shopify_order_no', 'like', '%' . $params['q'] . '%')
                        ->orWhere('shopify_order_name', 'like', '%' . $params['q'] . '%')
                        ->orWhereHas('vendorPurchaseOrders', function ($q) use ($params) {
                            $q->whereHas('vendor', function ($q) use ($params) {
                                $q->where('name', 'like', '%' . $params['q'] . '%');
                            });
                        })
                        ->orWhere('vendor_order_id', 'like', '%' . $params['q'] . '%')
                        ->orWhere('vendor_intacct_order_id', 'like', '%' . $params['q'] . '%')
                        ->orWhereHas('decorator', function ($q) use ($params) {
                            $q->where('name', 'like', '%' . $params['q'] . '%');
                        })
                        ->orWhere('decorator_order_id', 'like', '%' . $params['q'] . '%')
                        ->orWhere('decorator_intacct_order_id', 'like', '%' . $params['q'] . '%');
                });
            })
                ->when(isset($params['sort']), function ($q) use ($params) {
                    $q->orderBy(...explode(' ', $params['sort']));
                })->when(isset($params['q2']), function ($q) use ($params) {
                    $q->whereIn('user_id', json_decode($params['q2']));
                })->when(isset($params['on_hold']), function ($q) use ($params) {
                    $q->where('fraud_status', "FRAUD");
                })->when(isset($params['on_hold']), $callback)
                //ST-36
                ->when(isset($params['unsynced_orders']), function ($q) use ($params) {
                    $q->whereDate('created_at', '<=', now()->subDays(15))
                        ->where(function ($q) {
                            $q->orWhereNull(['decorator_order_id', 'decorator_intacct_order_id']);
                        })->whereHas('vendorPurchaseOrders', function ($q) {
                            $q->where(function ($q) {
                                $q->orWhereNull(['po_number', 'intact_po_number']);
                            });
                        });
                    if ($params['unsynced_orders'] == "vip")
                        $q->where('is_vip', true);
                    else if ($params['unsynced_orders'] == "standard")
                        $q->where('is_vip', false);
                    else if ($params['unsynced_orders'] == "vip_intact") {
                        $q->where('is_vip', true);
                        $q->where(function ($q) {
                            $q->orWhereNull('decorator_intacct_order_id');
                        })->whereHas('vendorPurchaseOrders', function ($q) {
                            $q->whereNotNull('intact_po_number');
                        });
                    } else if ($params['unsynced_orders'] == "standard_intact") {
                        $q->where('is_vip', false);
                        $q->where(function ($q) {
                            $q->orWhereNull('decorator_intacct_order_id');
                        })->whereHas('vendorPurchaseOrders', function ($q) {
                            $q->whereNotNull('intact_po_number');
                        });
                    }
                })->when(isset($params['unsynced_orders']), $callback)
                ->when(isset($params['filter']), function ($q) use ($params) {
                    $decoded = json_decode($params['dates']);
                    $q->whereDate('created_at', '>=', $decoded->start);
                    $q->whereDate('created_at', '<=', $decoded->end);
                })->when(isset($params['vendor_id']) || isset($params['decorator_id']), $callback)
                ->when(@$params['type'] == "vendor" && $params['vendor_id'], function ($q) use ($params) {
                    $q->whereHas('updates', function ($q) use ($params) {
                        $vendor = Vendor::find($params['vendor_id']);
                        $q->when($params['status'] == "success", function ($q) use ($vendor) {
                            $q->whereIn('type', ['sent_to_vendor', 'sent_to_intacct_for_vendor'])->where('name', 'LIKE', '%' . $vendor->name)->whereNull('failed_at')->whereNotNull('completed_at');
                        });
                        $q->when($params['status'] == "failed", function ($q) use ($vendor) {
                            $q->whereIn('type', ['sent_to_vendor', 'sent_to_intacct_for_vendor'])->where('name', 'LIKE', '%' . $vendor->name)->whereNull('completed_at')->whereNotNull('failed_at');
                        });
                    });
                })
                ->when(@$params['type'] == "decorator" && $params['decorator_id'], function ($q) use ($params) {
                    $q->whereHas('updates', function ($q) use ($params) {
                        $decorator = Decorator::find($params['decorator_id']);
                        $q->when($params['status'] == "success", function ($q) use ($decorator) {
                            $q->whereIn('type', ['sent_to_decorator', 'sent_to_intacct_for_decorator'])->where('name', 'LIKE', '%' . $decorator->name)->whereNull('failed_at')->whereNotNull('completed_at');
                        });
                        $q->when($params['status'] == "failed", function ($q) use ($decorator) {
                            $q->whereIn('type', ['sent_to_decorator', 'sent_to_intacct_for_decorator'])->where('name', 'LIKE', '%' . $decorator->name)->whereNull('completed_at')->whereNotNull('failed_at');
                        });
                    });
                })
                ->when(isset($params['order_status_type']), function ($q) use ($params) {
                    $q->whereHas('updates', function ($q) use ($params) {
                        $q->where('type', $params['order_status_type'])->whereNull('completed_at');
                    });
                })->when(isset($params['type']) && $params['type'] == "zero", function ($q) use ($params) {
                    $q->whereHas('vendorPrices', function ($query) {
                        $query->where('price', 0);
                    });
                })->get()->pluck('id');
        }

        // $orders = InconnectOrder::findMany($orders_ids);
        foreach ($orders_ids as $key => $order_id) {
            $order = InconnectOrder::find($order_id);
            $order->update(['is_archived' => true]);
            $updateDateTime = Carbon::now()->timezone('America/Chicago');
            $order->updates()->each(function ($update) use ($updateDateTime) {
                if ($update->failed_at || !$update->completed_at) {
                    $update->update([
                        'failed_at' => null,
                        'completed_at' => $updateDateTime,
                    ]);
                }
            });
        }

        return responseJson(true, 'Selected Orders Archived');
    }

    public function show($id)
    {
        $order = InconnectOrder::with([
            'inconnectAccount.intact_customer',
            'vendorPrices' => function ($query) {
                $query->with('vendor');
            },
            'logs',
            'updates',
            'manual_user',
            'vendorPurchaseOrders',
            'batchedOrder.batch.batchSetting.vendor'
        ])->find($id);
        $user = $order->user;
        $shopifyOrder = $user->api()->rest('GET', '/admin/api/2023-10/orders/' . $order->shopify_order_id . '.json');
        $order['shopify_order'] = $shopifyOrder['body']['order'];

        $queryQL = <<<GRAPHQL
        {
            order(id: "gid://shopify/Order/{$order->shopify_order_id}") {
              id
              ... on Order {
                legacyResourceId
                processedAt
                risk {
                    assessments {
                        facts {
                            description
                            sentiment
                        }
                        riskLevel
                    }
                    recommendation
                }
              }
            }
        }
        GRAPHQL;

        $fraud = $user->api()->graph($queryQL);

        return responseJson(true, 'Order retrieved successfully!', $order, $fraud['body']['data']['order']);
    }

    public function restart(Request $request)
    {
        $callback = function ($query) use ($request) {
            $table_name = $query->getModel()->getTable();
            $equal = Carbon::parse($request->get('start_date'))->eq($request->get('end_date'));
            if ($request->get('start_date') && $request->get('end_date') && !$equal) {
                $query->whereDate($table_name . '.created_at', '>=', $request->get('start_date'))->whereDate($table_name . '.created_at', '<=', $request->get('end_date'));
            }

            if ($request->get('user_id') && $query->from != DB::connection('all_in_one_conn')->getDatabaseName() . '.users') {
                $query->where('user_id', $request->get('user_id'));
            }
        };

        $orders_ids = json_decode($request->orders_ids);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;
        parse_str($search_query, $params);
        if ($all_check == "true") {

            $orders_ids = InconnectOrder::with(['user.inconnect_account.fraud_statuses', 'manual_user', 'vendor', 'decorator', 'updates', 'vendorPurchaseOrders.vendor'])->when(isset($params['q']), function ($q) use ($params) {
                $q->where(function ($q) use ($params) {
                    $q->whereHas('user', function ($q) use ($params) {
                        $q->where('name', 'like', '%' . $params['q'] . '%');
                    })->orWhere('shopify_customer_name', 'like', '%' . $params['q'] . '%')
                        ->orWhere('shopify_order_no', 'like', '%' . $params['q'] . '%')
                        ->orWhere('shopify_order_name', 'like', '%' . $params['q'] . '%')
                        ->orWhereHas('vendorPurchaseOrders', function ($q) use ($params) {
                            $q->whereHas('vendor', function ($q) use ($params) {
                                $q->where('name', 'like', '%' . $params['q'] . '%');
                            });
                        })
                        ->orWhere('vendor_order_id', 'like', '%' . $params['q'] . '%')
                        ->orWhere('vendor_intacct_order_id', 'like', '%' . $params['q'] . '%')
                        ->orWhereHas('decorator', function ($q) use ($params) {
                            $q->where('name', 'like', '%' . $params['q'] . '%');
                        })
                        ->orWhere('decorator_order_id', 'like', '%' . $params['q'] . '%')
                        ->orWhere('decorator_intacct_order_id', 'like', '%' . $params['q'] . '%');
                });
            })
                ->when(isset($params['sort']), function ($q) use ($params) {
                    $q->orderBy(...explode(' ', $params['sort']));
                })->when(isset($params['q2']), function ($q) use ($params) {
                    $q->whereIn('user_id', json_decode($params['q2']));
                })->when(isset($params['on_hold']), function ($q) use ($params) {
                    $q->where('fraud_status', "FRAUD");
                })->when(isset($params['on_hold']), $callback)
                //ST-36
                ->when(isset($params['unsynced_orders']), function ($q) use ($params) {
                    $q->whereDate('created_at', '<=', now()->subDays(15))
                        ->where(function ($q) {
                            $q->orWhereNull(['decorator_order_id', 'decorator_intacct_order_id']);
                        })->whereHas('vendorPurchaseOrders', function ($q) {
                            $q->where(function ($q) {
                                $q->orWhereNull(['po_number', 'intact_po_number']);
                            });
                        });
                    if ($params['unsynced_orders'] == "vip")
                        $q->where('is_vip', true);
                    else if ($params['unsynced_orders'] == "standard")
                        $q->where('is_vip', false);
                    else if ($params['unsynced_orders'] == "vip_intact") {
                        $q->where('is_vip', true);
                        $q->where(function ($q) {
                            $q->orWhereNull('decorator_intacct_order_id');
                        })->whereHas('vendorPurchaseOrders', function ($q) {
                            $q->whereNotNull('intact_po_number');
                        });
                    } else if ($params['unsynced_orders'] == "standard_intact") {
                        $q->where('is_vip', false);
                        $q->where(function ($q) {
                            $q->orWhereNull('decorator_intacct_order_id');
                        })->whereHas('vendorPurchaseOrders', function ($q) {
                            $q->whereNotNull('intact_po_number');
                        });
                    }
                })->when(isset($params['unsynced_orders']), $callback)
                ->when(isset($params['filter']), function ($q) use ($params) {
                    $decoded = json_decode($params['dates']);
                    $q->whereDate('created_at', '>=', $decoded->start);
                    $q->whereDate('created_at', '<=', $decoded->end);
                })->when(isset($params['vendor_id']) || isset($params['decorator_id']), $callback)
                ->when(@$params['type'] == "vendor" && $params['vendor_id'], function ($q) use ($params) {
                    $q->whereHas('updates', function ($q) use ($params) {
                        $vendor = Vendor::find($params['vendor_id']);
                        $q->when($params['status'] == "success", function ($q) use ($vendor) {
                            $q->whereIn('type', ['sent_to_vendor', 'sent_to_intacct_for_vendor'])->where('name', 'LIKE', '%' . $vendor->name)->whereNull('failed_at')->whereNotNull('completed_at');
                        });
                        $q->when($params['status'] == "failed", function ($q) use ($vendor) {
                            $q->whereIn('type', ['sent_to_vendor', 'sent_to_intacct_for_vendor'])->where('name', 'LIKE', '%' . $vendor->name)->whereNull('completed_at')->whereNotNull('failed_at');
                        });
                    });
                })
                ->when(@$params['type'] == "decorator" && $params['decorator_id'], function ($q) use ($params) {
                    $q->whereHas('updates', function ($q) use ($params) {
                        $decorator = Decorator::find($params['decorator_id']);
                        $q->when($params['status'] == "success", function ($q) use ($decorator) {
                            $q->whereIn('type', ['sent_to_decorator', 'sent_to_intacct_for_decorator'])->where('name', 'LIKE', '%' . $decorator->name)->whereNull('failed_at')->whereNotNull('completed_at');
                        });
                        $q->when($params['status'] == "failed", function ($q) use ($decorator) {
                            $q->whereIn('type', ['sent_to_decorator', 'sent_to_intacct_for_decorator'])->where('name', 'LIKE', '%' . $decorator->name)->whereNull('completed_at')->whereNotNull('failed_at');
                        });
                    });
                })
                ->when(isset($params['order_status_type']), function ($q) use ($params) {
                    $q->whereHas('updates', function ($q) use ($params) {
                        $q->where('type', $params['order_status_type'])->whereNull('completed_at');
                    });
                })->when(isset($params['type']) && $params['type'] == "zero", function ($q) use ($params) {
                    $q->whereHas('vendorPrices', function ($query) {
                        $query->where('price', 0);
                    });
                })->get()->pluck('id');
        }

        // $orders = InconnectOrder::findMany($orders_ids);
        foreach ($orders_ids as $key => $order_id) {
            $inconnectOrder = InconnectOrder::find($order_id);

            if($inconnectOrder->is_archived) {
                logger("No Restart Process: " . "Order is archived.");
                continue;
            }

            $user = User::find($inconnectOrder->user_id);

            $orderResponse = $user->api()->rest('GET', '/admin/api/2023-10/orders/' . $inconnectOrder->shopify_order_id . '.json');
            $shopifyOrder = $orderResponse['body']['order'];

            //CHECKING IF THERE IS NO UPDATES AVAILABLE. ONLY RECIEVED UPDATE IS AVAILABLE MEANS ORDER WAS NOT PROCESSED FURTHER
            $status_count = $inconnectOrder->updates()->whereNot('type', 'received')->whereNot('type', 'intacct_sales_order')->count();
            if ($status_count == 0) {
                OrderCreateJob::dispatch($user, $shopifyOrder);
                logger("RestartProcessCall Zero: " . "Order Started Above All");
                continue;
            }

            // TO SEND ORDER THAT IS NOT PLACED AT ALL. GET IT FROM SHOPIFY AND SEND IT TO BELOW JOB THE IT WILL BE ADDED TO SYSTEM
            // OrderCreateJob::dispatch($user, $shopifyOrder);
            // return sendResponse(true, "Order Re-Initiated because no other statuses found except Received.");

            $order = $this->graphQLOrderResponse($inconnectOrder->shopify_order_id, $user);
            // Log::info("cth bas: " . json_encode($order));

            $gooselyRule = $this->gooselyRuleProcess($order);

            // logger(json_encode($inconnectOrder->updates));
            $inconnectOrder->updates->each(function ($order_update) use ($shopifyOrder, $inconnectOrder, $user, $order, $gooselyRule) {
                if (!$order_update->completed_at) {
                    if ($order_update->type == "intacct_sales_order") {
                        logger("RestartProcessCall One One " . json_encode($order_update));
                        IntacctSalesOrderJob::dispatch($shopifyOrder, $inconnectOrder);
                        // Only Test
                        // IntacctSalesOrderJob::dispatch($shopifyOrder, $inconnectOrder, 'Sales Order', false, true);
                    } else if ($order_update->type == "intacct_sales_invoice") {
                        logger("RestartProcessCall One Two " . json_encode($order_update));
                        IntacctSalesOrderJob::dispatch($shopifyOrder, $inconnectOrder, 'Sales Invoice');
                    } else if ($order_update->name == "Purchase Order for Idex" || $order_update->name == "Purchase Order for Screen Pro Graphics") {
                        logger("RestartProcessCall One Three " . json_encode($order_update));
                        $order = json_decode(json_encode($order), true);
                        $order['original'] = $order;
                        $this->decideDecorator($user, $shopifyOrder, $inconnectOrder, $order, $gooselyRule);
                        // Only Test
                        // $this->decideDecorator($user, $shopifyOrder, $inconnectOrder, $order, $gooselyRule, false, true);
                    } else if ($order_update->name == "Intacct Purchase Order for Idex" || $order_update->name == "Intacct Purchase Order for Screen Pro Graphics") {
                        logger("RestartProcessCall One Four " . json_encode($order_update));
                        $order = json_decode(json_encode($order), true);
                        $order['original'] = $order;
                        $this->decideDecorator($user, $shopifyOrder, $inconnectOrder, $order, $gooselyRule, false, false, true);
                        // Only Test
                        // $this->decideDecorator($user, $shopifyOrder, $inconnectOrder, $order, $gooselyRule, false, true);
                    } else if (strpos($order_update->name, "Intacct Vendor Invoice") !== false) {
                        logger("RestartProcessCall One Five" . json_encode($order_update));
                        $inconnectOrder->vendorPurchaseOrders->each(function ($order_inside) use ($order_update, $shopifyOrder, $inconnectOrder, $user, $order, $gooselyRule) {
                            if (strpos($order_update->name, "Intacct Vendor Invoice") !== false) {
                                IntacctVendorInvoiceJob::dispatch($order_inside);
                            }
                        });
                    }
                }
            });

            $lineItems = $order['body']['data']['order']['lineItems'];
            $lineItems = collect($lineItems['edges']);
            $vendors = $lineItems->groupBy('node.product.vendor');

            $excludedVendors = $user->inconnect_account->ignored_vendors->pluck('id')->toArray();

            $vendors->each(function ($splitLineItems, $key) use ($user, $shopifyOrder, $inconnectOrder, $order, $excludedVendors, $gooselyRule) {
                $order = json_decode(json_encode($order), true);
                $order['original'] = $order;
                $order['body']['data']['order']['lineItems']['edges'] = $splitLineItems->toArray();

                $shopifyVendor = ShopifyVendorVendor::whereNotIn('vendor_id', $excludedVendors)->whereHas('shopifyVendor', function ($q) use ($key, $excludedVendors) {
                    $q->where('name', $key);
                    $q->whereNotIn('id', $excludedVendors);
                })->with('vendor')->first();

                if ($shopifyVendor?->vendor) {
                    $oneTimeDecorator = true;
                    $inconnectOrder->updates->each(function ($order_update) use ($shopifyOrder, $inconnectOrder, $user, $order, $gooselyRule, $shopifyVendor, &$oneTimeDecorator) {
                        if (!$order_update->completed_at) {
                            if (($order_update->name == "Purchase Order for Alpha" || $order_update->name == "Intacct Purchase Order for Alpha") && $shopifyVendor->vendor->name == "Alpha") {
                                logger("RestartProcessCall Two One " . json_encode($order_update));
                                VendorOrderJob::dispatch($user, $shopifyOrder, $inconnectOrder, $order, $shopifyVendor->vendor, $gooselyRule, false, $oneTimeDecorator);
                                $oneTimeDecorator = false;
                            } else if (($order_update->name == "Purchase Order for SanMar" || $order_update->name == "Intacct Purchase Order for SanMar") && $shopifyVendor->vendor->name == "SanMar") {
                                logger("RestartProcessCall Two Two" . json_encode($order_update));
                                VendorOrderJob::dispatch($user, $shopifyOrder, $inconnectOrder, $order, $shopifyVendor->vendor, $gooselyRule, false, $oneTimeDecorator);
                                //only Test
                                // VendorOrderJob::dispatch($user, $shopifyOrder, $inconnectOrder, $order, $shopifyVendor->vendor, $gooselyRule, true, $oneTimeDecorator);
                                $oneTimeDecorator = false;
                            } else if (($order_update->name == "Purchase Order for S&S Activewear" || $order_update->name == "Intacct Purchase Order for S&S Activewear") && $shopifyVendor->vendor->name == "S&S Activewear") {
                                logger("RestartProcessCall Two Three" . json_encode($order_update));
                                VendorOrderJob::dispatch($user, $shopifyOrder, $inconnectOrder, $order, $shopifyVendor->vendor, $gooselyRule, false, $oneTimeDecorator);
                                //only Test
                                // VendorOrderJob::dispatch($user, $shopifyOrder, $inconnectOrder, $order, $shopifyVendor->vendor, $gooselyRule, true, $oneTimeDecorator);
                                $oneTimeDecorator = false;
                            } else if (($order_update->name == "Purchase Order for CC Stock" || $order_update->name == "Intacct Purchase Order for CC Stock") && $shopifyVendor->vendor->name == "CC Stock") {
                                logger("RestartProcessCall Two Four" . json_encode($order_update));
                                VendorOrderJob::dispatch($user, $shopifyOrder, $inconnectOrder, $order, $shopifyVendor->vendor, $gooselyRule, false, $oneTimeDecorator);
                                //only Test
                                // VendorOrderJob::dispatch($user, $shopifyOrder, $inconnectOrder, $order, $shopifyVendor->vendor, $gooselyRule, true, $oneTimeDecorator);
                                $oneTimeDecorator = false;
                            } else if (($order_update->name == "Purchase Order for Piranha Brands" || $order_update->name == "Intacct Purchase Order for Piranha Brands") && $shopifyVendor->vendor->name == "Piranha Brands") {
                                logger("RestartProcessCall Two Five" . json_encode($order_update));
                                VendorOrderJob::dispatch($user, $shopifyOrder, $inconnectOrder, $order, $shopifyVendor->vendor, $gooselyRule, false, $oneTimeDecorator);
                                //only Test
                                // VendorOrderJob::dispatch($user, $shopifyOrder, $inconnectOrder, $order, $shopifyVendor->vendor, $gooselyRule, true, $oneTimeDecorator);
                                $oneTimeDecorator = false;
                            }
                        }
                    });
                }
            });
        }

        return responseJson(true, 'Selected Orders Restarted');
    }

    public function fraudOrderDone(Request $request)
    {
        $inconnectOrder = InconnectOrder::find($request->order_id);
        $user = User::find($inconnectOrder->user_id);

        if (isset($request->type) && $inconnectOrder->fraud_status == "FRAUD") {
            $inconnectOrder->update(['fraud_status' => 'APPROVED']);

            $order = $user->api()->rest('GET', '/admin/api/2023-10/orders/' . $inconnectOrder->shopify_order_id . '.json');
            $payload = $order['body']['order'];

            OrderCreateJob::dispatch($user, $payload);

            return responseJson(true, 'Fraud Order Processed!');
        } else {
            return responseJson(false, 'Fraud Order cannot be processed!');
        }
    }

    public function declineFraud($id)
    {
        $inconnectOrder = InconnectOrder::firstWhere('shopify_order_id', $id);
        $inconnectOrder->update(['fraud_status' => 'DECLINED']);

        return responseJson(true, 'Fraud Declined!');
    }

    public function completeOrderManually(Request $request)
    {
        $order = InconnectOrder::find($request->order_id);
        $updateDateTime = Carbon::now()->timezone('America/Chicago');
        $order->updates()->each(function ($update) use ($updateDateTime) {
            if ($update->failed_at || !$update->completed_at) {
                // logger($update);
                $update->update([
                    'failed_at' => null,
                    'completed_at' => $updateDateTime,
                    'manual_complete' => true,
                    'manual_log' => $update->name . " Manually Completed by " . auth()->user()->name
                ]);
            }
        });

        $order->update([
            'manual_note' => $request->manual_note,
            'manual_user_id' => auth()->user()->id,
            'manual_date' => $updateDateTime,
        ]);

        return responseJson(true, 'Order Manually Completed!');
    }
}
