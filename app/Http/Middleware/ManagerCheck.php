<?php

namespace App\Http\Middleware;

use App\Models\AllInOne\ApplicationStatus;
use App\Models\AllInOne\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

class ManagerCheck
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Log::info($request->method());
        // $currentRouteName = Route::currentRouteName();
        // Log::info($currentRouteName);

        // get-fullfill-orders
        // /
        // login
        // logout
        // dashboard
        // users
        // get_shop_real







        //API CHECK
        if (strpos($request->path(), "maven") !== false) {
            return $next($request);
        }

        if (Auth::user()) {
            if (Auth::user()->role_id == 3) {
                $currentRoutePath = $request->path();

                if (
                    $currentRoutePath != "/" &&
                    $currentRoutePath != "get-fullfill-orders" &&
                    $currentRoutePath != "order_splitter/shipment-response" &&
                    $currentRoutePath != "login" &&
                    $currentRoutePath != "logout" &&
                    $currentRoutePath != "dashboard" &&
                    $currentRoutePath != "get_shop_real" &&
                    $currentRoutePath != "all_in_one/get_dashboard" &&
                    $currentRoutePath != "analytics/fetch-dashboard-content" &&
                    $currentRoutePath != "order_splitter/get_dashboard_data" &&
                    $currentRoutePath != "virtual_options/get_dashboard_data" &&
                    $currentRoutePath != "punchout/dashboard" &&
                    $currentRoutePath != "punchout/tools"
                    
                ) {
                    // Log::info($currentRoutePath);


                    //GENERAL APP STATUS CHECK ##########################################################
                    $app_status = "";
                    $manager_check = false;
                    $statuses = ApplicationStatus::with(['application', 'inconnect'])->where('status', 1)->where('user_id', Auth::user()->id)->get();
                    foreach ($statuses as $key => $value) {
                        $app_name = str_replace(' ', '_', strtolower($value->application->name));
                        // Log::info($app_name);
                        // Log::info($currentRoutePath);

                        if (strpos($currentRoutePath, $app_name) !== false) {
                            $app_status = $value;
                            $manager_check = true;
                            // Log::info("'$app_name' is included in the string.");
                        } else {
                            // Log::info("'$app_name' is not included in the string.");
                        }
                    }
                    if (!$manager_check) {
                        return redirect()->route('index');
                    }

                    $generalReadWriteCheck = true; 

                    /**************** Inconnect Appplication ******************/

                    if (count($app_status->inconnect) > 0) {
                        // Log::info("CHECKING INCONNECT");
                        $inconnectTabs = [
                            'Shopify Accounts' => 'shopify-accounts',
                            'Vendors' => 'vendors',
                            'Decorators' => 'decorators'
                        ];
                        foreach ($app_status->inconnect as $key => $value) {
                            if ($inconnectTabs[$value->type] && strpos($currentRoutePath, $inconnectTabs[$value->type]) !== false) {
                                $generalReadWriteCheck = false;
                                // Check for read access
                                if (!$value->read_access) {
                                    // Log::info("GET NOT ALLOWED");
                                    return redirect()->route('index');
                                }

                                // Check for write access if the request method isn't GET
                                if (!$value->write_access && $request->method() != "GET") {
                                    // Log::info("POST NOT ALLOWED");
                                    return response()->json(['success' => false, 'message' => "You don't have write permissions."], 403);
                                }
                            }   
                        }
                    }
     
                    /**************** Punchout Appplication ******************/

                    if(count($app_status->punchout) > 0){
                        $punchoutTabs = [
                            'Custom Quote' => 'custom-quote',
                            'Discount Code'=>'discount-code',
                            'Product Quantity'=>'product-quantity'
                        ];

                        foreach ($app_status->punchout as $key => $value) {
                            if ($punchoutTabs[$value->type] && strpos($currentRoutePath, $punchoutTabs[$value->type]) !== false) {
                                $generalReadWriteCheck = false;
                                // Check for read access
                                if (!$value->read_access) {
                                    // Log::info("GET NOT ALLOWED");
                                    return response()->json(['success' => false, 'message' => "You don't have write permissions."], 403);
                                }

                                // Check for write access if the request method isn't GET
                                if (!$value->write_access && $request->method() != "GET") {
                                    // Log::info("POST NOT ALLOWED");
                                    return response()->json(['success' => false, 'message' => "You don't have write permissions."], 403);
                                }
                            }
                        }
                    }

                    if($generalReadWriteCheck) {
                        
                        //CHECK READ AND WRITE PERMISSION ##########################################################
                        // Log::info($currentRoutePath);
                        // Log::info(json_encode($app_status));

                        if (!$app_status->read_access) {
                            // Log::info("GET NOT ALLOWED");
                            return redirect()->route('index');
                        }

                        if (!$app_status->write_access) {
                            if ($request->method() != "GET") {
                                // Log::info("POST NOT ALLOWED");
                                return response()->json(['success' => false, 'message' => "You don't have write permissions."], 403);
                            }
                        }
                    }
                }
            }
        }









        if (isset($request->shop) && strpos($request->path(), 'api') !== false) {
            $user = User::with('applications')->where('name', $request->shop)->first();
            if(!$user)
                return sendResponse(false, "Application Uninstalled or does not exist");

            foreach ($user->applications as $key => $app) {

                if ($app->pivot->application_id == 3 && !$app->pivot->status) {
                    if ($request->path() == "api/purchase_order/create_order") {
                        return sendResponse(false, "APP IS TURNED OFF");
                    } else if ($request->path() == "api/purchase_order/get_store_rule") {
                        return sendResponse(false, "APP IS TURNED OFF");
                    } else if ($request->path() == "api/purchase_order/get_user_orders") {
                        return sendResponse(false, "APP IS TURNED OFF");
                    }
                } else if ($app->pivot->application_id == 4 && !$app->pivot->status) {

                    if ($request->path() == "api/virtual_options/get_product_options") {
                        return sendResponse(false, "APP IS TURNED OFF");
                    } else if ($request->path() == "api/virtual_options/get_logo_cash") {
                        return sendResponse(false, "APP IS TURNED OFF");
                    }
                } else if ($app->pivot->application_id == 5 && !$app->pivot->status) {
                    if ($request->path() == "api/size_chart/apply-rule") {
                        return sendResponse(false, "APP IS TURNED OFF");
                    } else if ($request->path() == "api/size_chart/get-setting") {
                        return sendResponse(false, "APP IS TURNED OFF");
                    }
                }
            }
        }

        return $next($request);
    }
}
