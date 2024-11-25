<?php

namespace App\Http\Controllers\InConnect;

use App\Http\Controllers\Controller;
use App\Models\AllInOne\User;
use App\Models\InConnect\Decorator;
use App\Models\InConnect\InconnectLog;
use App\Models\InConnect\InconnectOrder;
use App\Models\InConnect\InconnectOrderUpdate;
use App\Models\InConnect\Vendor;
use Carbon\Carbon;
use DB;
use Illuminate\Http\Request;
use SoapClient;
use SoapFault;
use SoapHeader;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $users = User::whereRoleId(2)->orderBy('store_name', 'asc')->lazy();
        $filter = ($request->acceptsJson() && ($request->has('start_date') && $request->has('end_date')) && !$request->get('reset')) || $request->get('selected_store');
        $callback = function ($query) use ($request) {
            $table_name = $query->getModel()->getTable();
            $equal = Carbon::parse($request->get('start_date'))->eq($request->get('end_date'));
            if ($request->get('start_date') && $request->get('end_date') && !$equal) {
                $query->whereDate($table_name . '.created_at', '>=', $request->get('start_date'))->whereDate($table_name . '.created_at', '<=', $request->get('end_date'));
            }

            if ($request->get('selected_store') && $query->from != DB::connection('all_in_one_conn')->getDatabaseName() . '.users') {
                if ($table_name == 'inconnect_order_updates') {
                    $query->whereHas('order', function ($q) use ($request) {
                        $q->whereHas('user', function ($q) use ($request) {
                            $q->where('users.id', $request->get('selected_store'));
                        });
                    });
                } else
                    $query->where('user_id', $request->get('selected_store'));
            }
        };

        $order_statuses = InconnectOrderUpdate::when($filter, $callback)->whereNotIn('type', ['received', 'received_on_decorator'])->whereNull('completed_at')->select(DB::raw("REPLACE(type, '_', ' ') as UpdateName, type"), DB::raw('COUNT(*) AS OrdersCount'))
        ->groupBy('type')
        ->orderBy('UpdateName')
        ->get()->sortBy([
            ['order', 'asc']
        ])->values()->all();

        $possibleStatuses = [
            'intacct_sales_order',
            'sent_to_vendor',
            'sent_to_intacct_for_vendor',
            'sent_to_decorator',
            'sent_to_intacct_for_decorator',
            'shipped_from_decorator',
            'fulfilled',
            'intacct_sales_invoice',
            'intacct_vendor_invoice'
        ];

        $order_statuses_updated = $order_statuses;
        foreach ($possibleStatuses as $key => $statusInside) {
            $checkInside = collect($order_statuses)->where('type',$statusInside)->first();
            if (!$checkInside) {
                $order_statuses_updated[] = [
                    "UpdateName" => str_replace('_', ' ', $statusInside),
                    "type" => $statusInside,
                    "OrdersCount" => 0,
                    "order" => 0,
                    "is_pending" => true
                ];
            }
        }
        $order_statuses = $order_statuses_updated;

        $zero_dollar_orders = InconnectOrder::whereHas('vendorPrices', function ($query) {
            $query->where('price', 0);
        })->count();

        $total_orders = InconnectOrder::with('vendorPurchaseOrders')->when($filter, $callback)->count();
        $total_intacct_orders = InconnectOrder::when($filter, $callback)->whereHas('vendorPurchaseOrders', function ($q) {
            $q->whereNotNull('intact_po_number');
        })->whereNotNull('decorator_intacct_order_id')->count();
        $failed_orders = InconnectOrder::when($filter, $callback)->whereHas('vendorPurchaseOrders', function ($q) {
            $q->whereNull(['po_number', 'intact_po_number']);
        })->whereNull(['decorator_order_id', 'decorator_intacct_order_id'])->count();
        $failed_intacct_orders = InconnectOrder::when($filter, $callback)->whereHas('vendorPurchaseOrders', function ($q) {
            $q->whereNull('intact_po_number');
        })->whereNull('decorator_intacct_order_id')->count();
        $success_orders = InconnectOrder::when($filter, $callback)->whereHas('vendorPurchaseOrders', function ($q) {
            $q->whereNotNull(['po_number', 'intact_po_number']);
        })->whereNotNull(['decorator_order_id', 'decorator_intacct_order_id'])->count();
        $success_intacct_orders = InconnectOrder::when($filter, $callback)->whereHas('vendorPurchaseOrders', function ($q) {
            $q->whereNotNull('intact_po_number');
        })->whereNotNull('decorator_intacct_order_id')->count();
        $pending_integration = User::when($filter, $callback)->whereDoesntHave('inconnect_account')->whereRoleId(2)->count();
        $errors_before_integration = InconnectLog::when($filter, $callback)->where('type', 'ERROR')->count();
        $current_fraud_orders = InconnectOrder::when($filter, $callback)->where('fraud_status', 'FRAUD')->count();
        $unsynced_15_days_orders = InconnectOrder::when($filter, $callback)->when(!$filter, function ($q) {
            $q->whereDate('created_at', '<=', now()->subDays(15));
        })->where(function ($q) {
            $q->orWhereNull(['decorator_order_id', 'decorator_intacct_order_id']);
        })->whereHas('vendorPurchaseOrders', function ($q) {
            $q->where(function ($q) {
                $q->orWhereNull(['po_number', 'intact_po_number']);
            });
        });
        $vip = $unsynced_15_days_orders->clone()->where('is_vip', true)->count();
        $vip_intacct = $unsynced_15_days_orders->clone()->where('is_vip', true)->where(function ($q) {
            $q->orWhereNull('decorator_intacct_order_id');
        })->whereHas('vendorPurchaseOrders', function ($q) {
            $q->whereNotNull('intact_po_number');
        })->count();
        $standard = $unsynced_15_days_orders->clone()->where('is_vip', false)->count();
        $standard_intacct = $unsynced_15_days_orders->clone()->where('is_vip', false)->where(function ($q) {
            $q->orWhereNull('decorator_intacct_order_id');
        })->whereHas('vendorPurchaseOrders', function ($q) {
            $q->whereNotNull('intact_po_number');
        })->count();
        // $vendors = Vendor::whereHas('vendorPurchaseOrders.inconnectOrder')->lazy()->map(function ($vendor) use ($filter, $callback) {
        //     $vendor->total_orders = $vendor->vendorPurchaseOrders()->whereHas('inconnectOrder', function ($q) use ($filter, $callback) {
        //         $q->when($filter, $callback);
        //     })->count();
        //     $vendor->failed_orders = $vendor->vendorPurchaseOrders()->whereHas('inconnectOrder', function ($q) use ($filter, $callback) {
        //         $q->when($filter, $callback);
        //     })->where(function ($q) {
        //         $q->orWhereNull(['po_number', 'intact_po_number']);
        //     })->count();
        //     $vendor->success_orders = $vendor->vendorPurchaseOrders()->whereHas('inconnectOrder', function ($q) use ($filter, $callback) {
        //         $q->when($filter, $callback);
        //     })->whereNotNull(['po_number', 'intact_po_number'])->count();
        //     return $vendor;
        // });

        // $decorators = Decorator::whereHas('inconnectOrders')->lazy()->map(function ($decorator) use ($filter, $callback) {
        //     $decorator->total_orders = $decorator->inconnectOrders()->when($filter, $callback)->count();
        //     $decorator->failed_orders = $decorator->inconnectOrders()->when($filter, $callback)->where(function ($q) {
        //         $q->orWhereNull(['decorator_order_id', 'decorator_intacct_order_id']);
        //     })->count();
        //     $decorator->success_orders = $decorator->inconnectOrders()->when($filter, $callback)->whereNotNull(['decorator_order_id', 'decorator_intacct_order_id'])->count();
        //     return $decorator;
        // });

        $vendors = Vendor::whereHas('vendorPurchaseOrders.inconnectOrder')->lazy()->map(function ($vendor) use ($filter, $callback) {
            $vendor->total_orders = InconnectOrderUpdate::when($filter, $callback)->whereIn('type', ['sent_to_vendor', 'sent_to_intacct_for_vendor'])->where('name', 'LIKE', '%' . $vendor->name)->count();
            $vendor->failed_orders = InconnectOrderUpdate::when($filter, $callback)->whereIn('type', ['sent_to_vendor', 'sent_to_intacct_for_vendor'])->where('name', 'LIKE', '%' . $vendor->name)->whereNull('completed_at')->whereNotNull('failed_at')->count();
            $vendor->success_orders = InconnectOrderUpdate::when($filter, $callback)->whereIn('type', ['sent_to_vendor', 'sent_to_intacct_for_vendor'])->where('name', 'LIKE', '%' . $vendor->name)->whereNull('failed_at')->whereNotNull('completed_at')->count();
            return $vendor;
        });

        $decorators = Decorator::whereHas('inconnectOrders')->lazy()->map(function ($decorator) use ($filter, $callback) {
            $decorator->total_orders = InconnectOrderUpdate::when($filter, $callback)->whereIn('type', ['sent_to_decorator', 'sent_to_intacct_for_decorator'])->where('name', 'LIKE', '%' . $decorator->name)->count();
            $decorator->failed_orders = InconnectOrderUpdate::when($filter, $callback)->whereIn('type', ['sent_to_decorator', 'sent_to_intacct_for_decorator'])->where('name', 'LIKE', '%' . $decorator->name)->whereNull('completed_at')->whereNotNull('failed_at')->count();
            $decorator->success_orders = InconnectOrderUpdate::when($filter, $callback)->whereIn('type', ['sent_to_decorator', 'sent_to_intacct_for_decorator'])->where('name', 'LIKE', '%' . $decorator->name)->whereNull('failed_at')->whereNotNull('completed_at')->count();
            return $decorator;
        });

        if ($request->has('reset')) {
            return responseJson(true, 'Dashboard data filtered successfully', compact('total_orders', 'failed_orders', 'success_orders', 'pending_integration', 'errors_before_integration', 'vip', 'standard', 'vendors', 'decorators', 'total_intacct_orders', 'failed_intacct_orders', 'success_intacct_orders', 'vip_intacct', 'standard_intacct', 'order_statuses', 'zero_dollar_orders', 'current_fraud_orders'));
        }

        return inertia('Applications/InConnect/Dashboard/Dashboard', compact('total_orders', 'failed_orders', 'success_orders', 'pending_integration', 'errors_before_integration', 'vip', 'standard', 'vendors', 'decorators', 'users', 'total_intacct_orders', 'failed_intacct_orders', 'success_intacct_orders', 'vip_intacct', 'standard_intacct', 'order_statuses', 'zero_dollar_orders', 'current_fraud_orders'   ));
    }

    public function test()
    {
        // $username = 'Magda70';
        // $password = '12341234';

        // $username = '37144';
        // $password = 'ctase@clubcolors.com';

        // $username = 'magda70';
        // $password = 'club420';

        $username = '30548';
        $password = '9267f2e0-5ef6-4d9b-b2ca-1d0cf87095e8';

        // $username = 'Magdaochalik';
        // $password = 'Club2019!';

        // $username = 'CUSTOMINK';
        // $password = 'nstMG0]c+DP$-*rD4IreR2rlE#0XCp/g3e74$gz1h#Xz9%L%TxLjgI1uPDX4K:u';

        // $apiUrl = 'https://edev-ws.sanmar.com:8080/promostandards/POServiceBinding?WSDL';
        // $apiUrl = 'https://promostandards.ssactivewear.com/pricingandconfiguration/v1/wsdl/pricingandconfigurationservice.wsdl';
        // $apiUrl = 'https://pspurchaseorder100-stg.pcna.online/psPurchaseOrder.svc?singleWsdl';
        $apiUrl = 'https://promostandards.ssactivewear.com/productdata/v1/WSDL/ProductDataService.wsdl';
        // $apiUrl = 'https://edev-ws.sanmar.com:8080/promostandards/OrderStatusServiceBinding?wsdl';
        // $apiUrl = 'https://ws.sanmar.com:8080/promostandards/ProductDataServiceBinding?WSDL';
        // $apiUrl = 'https://edev-ws.sanmar.com:8080/promostandards/PricingAndConfigurationServiceBinding?WSDL';
        // $apiUrl = 'https://psproductdata100-stg.pcna.online/psProductData.svc?wsdl';
        // $apiUrl = 'https://psproductdata200.pcna.online/psProductData.svc?wsdl';
        // $apiUrl = 'https://psproductdata100-stg.pcna.online/psProductData.svc?wsdl';
        // $apiUrl = 'https://edev-ws.sanmar.com:8080/promostandards/PricingAndConfigurationServiceBinding?WSDL';
        // $apiUrl = 'https://testpromostandards.ssactivewear.com/pricingandconfiguration/v1/wsdl/pricingandconfigurationservice.wsdl';
        // $apiUrl = "https://edev-ws.sanmar.com:8080/promostandards/OrderStatusServiceBinding?wsdl";
        // $apiUrl = "https://ws.sanmar.com:8080/promostandards/OrderShipmentNotificationServiceBinding?WSDL";
        // $apiUrl = 'https://ws.sanmar.com:8080/promostandards/InvoiceServiceBindingV1_0_0?WSDL';
        // $apiUrl = 'https://edev-ws.sanmar.com:8080/promostandards/OrderShipmentNotificationServiceBinding?WSDL';
        // $apiUrl = 'https://devservices.alphabroder.com/OSN/WSDL/1.0.0/OrderShipmentNotificationService.wsdl';
        // $apiUrl = 'https://devservices.alphabroder.com/invoice2/wsdl/InvoiceService.wsdl';
        // $apiUrl = 'https://devservices.alphabroder.com/invoice2/wsdl/InvoiceService.wsdl';
        // $apiUrl = 'https://edi.atc-apparel.com/pstd/productdata2.0/ProductDataServiceV2.php?wsdl';



        // $apiUrl = 'https://pspriceconfig100.pcna.online/psPriceConfig.svc?wsdl';
        // $apiUrl = 'https://psmediacontent110-stg.pcna.online/psMediaContent.svc?wsdl';
        // $apiUrl = 'https://psinventory200-stg.pcna.online/psInventory.svc?wsdl';
        // Create SoapClient instance

        $client = new SoapClient($apiUrl, array('trace' => 1, 'soap_version' => SOAP_1_1));

        // Prepare SOAP headers
        $authHeader = new SoapHeader(
            'http://www.promostandards.org/WSDL/ProductDataService/1.0.0/',
            'Credentials',
            array('Username' => $username, 'Password' => $password),
            false
        );

        // Set the headers for the SoapClient instance
        // $client->__setSoapHeaders(array($authHeader));

        $GetProductSellable = array(
            'wsVersion' => '1.0.0',
            'id' => $username,
            'password' => $password,
            'localizationCountry' => 'US',
            'localizationLanguage' => 'en',
            'productId' => 'ACTIVE',
            'isSellable' => true,
        );

        $getOrderStatusDetails = array(
            'wsVersion' => '1.0.0',
            'id' => $username,
            'password' => $password,
            'queryType' => 4,
            'referenceNumber' => 'PO-12346-p-0374',

        );

        $getProduct = array(
            'wsVersion' => '1.0.0',
            'id' => $username,
            'password' => $password,
            'localizationCountry' => 'US',
            'localizationLanguage' => 'en',
            'productId' => '7033',
        );

        $getProductCloseOut = array(
            'wsVersion' => '2.0.0',
            'id' => $username,
            'password' => $password,
        );

        $getFobPoints = array(
            'wsVersion' => '1.0.0',
            'id' => $username,
            'password' => $password,
            'productId' => '7033',
            'localizationCountry' => 'US',
            'localizationLanguage' => 'en',
        );

        $getConfigurationAndPricing = array(
            'wsVersion' => '1.0.0',
            'id' => $username,
            'password' => $password,
            'productId' => '7033',
            'fobId' => 'NJ',
            'localizationCountry' => 'US',
            'localizationLanguage' => 'en',
            'currency' => 'USD',
            'priceType' => 'Customer',
            'configurationType' => 'Blank',
        );

        $getMediaContent = array(
            'wsVersion' => '1.0.0',
            'id' => $username,
            'password' => $password,
            'cultureName' => 'en-US',
            'mediaType' => 'Image',
            'productId' => '0600-10',
        );

        $getInventoryLevels = array(
            'wsVersion' => '2.0.0',
            'id' => $username,
            'password' => $password,
            'productId' => '0600-10',
        );

        $purchaseOrder = array(
            'wsVersion' => '1.0.0',
            'id' => $username,
            'password' => $password,
            'PO' => [
                "orderType" => "Sample",
                "orderNumber" => "PO-12347",
                "totalAmount" => "15.5",
                "orderDate" => "2019-11-05T11:12:13.000",
                "rush" => false,
                "currency" => "USD",
                "ShipmentArray" => [
                    'Shipment' => [
                        'ShipTo' => [
                            'shipmentId' => "12345",
                            'ContactDetails' => [
                                'address1' => "Jhandi.com",
                                'city' => "Washington DC",
                                'region' => 'WA',
                                'country' => "US",
                                'name' => "Jhandi.com",
                                'email' => "helloitsi@gmail.com",
                                'postalCode' => "20001",
                            ],
                            'customerPickup' => false,
                        ],
                        'packingListRequired' => false,
                        'blindShip' => false,
                        'allowConsolidation' => false,
                        'FreightDetails' => [
                            'carrier' => "FEDEX",
                            'service' => "2DAY"
                        ]
                    ]
                ],
                "LineItemArray" => [
                    "LineItem" => [
                        "lineNumber" => "12345",
                        "description" => "this is description",
                        "lineType" => "New",
                        "ToleranceDetails" => [
                            "tolerance" => "AllowOverrun"
                        ],
                        'allowPartialShipments' => false,
                        "lineItemTotal" => "20.0",
                        "PartArray" => [
                            "Part" => [
                                "partId" => 62822,
                                "customerSupplied" => false,
                                "Quantity" => [
                                    'value' => "1.0",
                                    'uom' => 'BX'
                                ]
                            ]
                        ]
                    ]
                ],
                "termsAndConditions" => "termsAndConditions"
            ],

        );

        $getInvoices = array(
            'wsVersion' => '1.0.0',
            'id' => $username,
            'password' => $password,
            'queryType' => 1,
            'referenceNumber' => 'POS#L&S1178',
        );
        $getOrderShipmentNotification = array(
            'wsVersion' => '1.0.0',
            'id' => $username,
            'password' => $password,
            'queryType' => 1,
            'referenceNumber' => 'POS-TEST#1294',
        );

        // $getSupportedOrderTypes = $purchaseOrder = array(
        //     'wsVersion' => '1.0.0',
        //     'id' => $username,
        //     'password' => $password,
        // );

        // Call the SOAP API method
        try {
            // $response = $client->getProductSellable($GetProductSellable); 
            // $response = $client->getProductCloseOut($getProductCloseOut);
            $response = $client->getProduct($getProduct);
            // $response = $client->getFobPoints($getFobPoints);
            // $response = $client->getConfigurationAndPricing($getConfigurationAndPricing);
            // $response = $client->getOrderStatusDetails($getOrderStatusDetails);
            // $response = $client->getInvoices($getInvoices);
            // $response = $client->getOrderShipmentNotification($getOrderShipmentNotification);
            // $response = $client->getSupportedOrderTypes($getSupportedOrderTypes);
            // $response = $client->getMediaContent($getMediaContent);
            // $response = $client->getInventoryLevels($getInventoryLevels);

            // $response = $client->sendPO($purchaseOrder);
            // $response = $client->getOrdcerStatusDetails($getOrderStatusDetails);


            // Display the response (you might want to process it accordingly)
            // header('Accept: application/json');
            return $response;
        } catch (SoapFault $e) {
            echo "Error: " . $e->getMessage();
        }
    }
}
