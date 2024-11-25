<?php

namespace App\Http\Controllers\InConnect;

use App\Http\Controllers\Controller;
use App\Traits\InConnect\IdexTrait;
use App\Traits\InConnect\IntacctTrait;
use App\Traits\InConnect\ScreenProTrait;
use App\Traits\GeneralTrait;
use App\Models\InConnect\InconnectOrder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Jobs\InConnect\SecondInvoiceJob;
use App\Jobs\InConnect\AddUpdateSalesOrderAndInvoice;
use App\Jobs\InConnect\DetectMissingSalesOrderAndInvoices;
use App\Jobs\InConnect\IntacctSalesOrderJob;
use App\Models\AllInOne\User;
use App\Models\InConnect\OrderEntry;
use App\Models\InConnect\GooselyRule;

class TestController extends Controller
{
    use IdexTrait, IntacctTrait, GeneralTrait, ScreenProTrait;

    public function index()
    {
        // $access_token = $this->getAccessToken();
        // $response = Http::withToken($access_token)->post('https://portal.idexint.com/api/v1/orders/query', [
        //     'customerID' => '46499100-dc6e-4617-baca-093fa787c15f',
        //     'orderIDList' => [
        //         "c964a7e2-d1bd-42d0-8808-e5c2ddbf515f"
        //     ]
        // ]);

        // return $response;
    }

    public function removeSO()
    {
        // $orders = InconnectOrder::whereNotNull('intact_sales_invoice_id')->whereNull('fulfillment_status')->get();
        // foreach ($orders as $key => $order_in) {
        //     // $this->removeSalesOrder($order_in->intact_sales_invoice_id);
        //     $order_in->intact_sales_invoice_id = NULL;
        //     $order_in->save();
        // }
        // return "ALL GOOD TO GO";
    }

    private function manageIdexStatusManually($inconnectOrders) {
        $inconnectOrders->each(function($order) {
            $existing_log_check = $order->updates()->where('name', 'Fulfilled from Shopify')->whereNotNull('completed_at')->first();
            if(!$existing_log_check) {    
                $order->logs()->create([
                    'user_id' => $order->user_id,
                    'type' => 'info',
                    'description' => $order->shopify_order_name . " Order Fulfilled manually because it was Fulfilled on Shopify forcely."
                ]);
            }

            $order->updates()->updateOrCreate([
                'name' => 'Fulfilled from Shopify',
                'type' => 'fulfilled',
            ], [
                'initiated_at' => now(),
                'completed_at' => now(),
                'failed_at' => null,
            ]);

            $existing_log_check = $order->updates()->where('name', 'Shipped from Idex')->whereNotNull('completed_at')->first();
            if(!$existing_log_check) {    
                $order->logs()->create([
                    'user_id' => $order->user_id,
                    'type' => 'info',
                    'description' => $order->shopify_order_name . " Order Shipped from Idex manually because it was Fulfilled on Shopify forcely."
                ]);
            }

            $order->updates()->updateOrCreate([
                'name' => 'Shipped from Idex',
                'type' => 'shipped_from_decorator',
                'initiated_at' => now(),
                'completed_at' => now(),
                'failed_at' => null,
                'tries' => 1
            ]);
        });
    }

    public function getAndUpdateInvoice()
    {

        // $orders = InconnectOrder::where('shopify_order_name','#EARTH1411')->whereNotNull('intact_sales_order_id')->get();
        
        // $orders = InconnectOrder::where('process',"ON")->get();
        // foreach ($orders as $key => $order) {
        // $order->second_si_id ? $this->removeSalesOrder($order->second_si_id) : NULL;
        // $order->second_so_id ? $this->removeSalesOrder($order->second_so_id) : NULL;
        //     $order->update([
        //         'second_so_id' => NULL,
        //         'second_si_id' => NULL,
        //         'process' => NULL
        //     ]);
        // }

        // ->where("process","ON")
        // $orders = InconnectOrder::where('created_at', '>=', '2024-06-01 00:00:00')->where('sales_order_check',true)->get()->pluck('id'); //954
        // $ordersTwo = InconnectOrder::where('fulfillment_status', 'fulfilled')->whereNull('intact_sales_invoice_id')->get()->pluck('id'); //259
        // // return array($orders, $orders);
        // $response = array_intersect($orders->toArray(), $ordersTwo->toArray());
        // $responseTwo = array_values($response);

        // $array1 = [1, 2, 3];
        // $array2 = [1, 2, 3, 4, 5];

        // // Remove elements of array1 from array2
        // $result = array_diff($ordersTwo->toArray(), $responseTwo);
        // $result = array_values($result);

        // return InconnectOrder::whereIn('id',$result)->get()->pluck("shopify_order_name");

        // $this->removeSalesOrder("Sales Order-SO62829");
        // $this->removeSalesOrder("Sales Invoice-SO62829");

        // $this->removeContact("112363");
        // $this->removeContact("78537");

        // $orders = InconnectOrder::where('fulfillment_status', 'fulfilled')->whereNotNull('intact_sales_order_id')->whereNull('intact_sales_invoice_id')->get(); //259
        // foreach ($orders as $key => $order) {
        //     $user = User::find($order->user_id);
        //     $orderResponse = $user->api()->rest('GET', '/admin/api/2023-10/orders/' . $order->shopify_order_id . '.json');
        //     $shopifyOrder = $orderResponse['body']['order'];
        //     IntacctSalesOrderJob::dispatch($shopifyOrder, $order, 'Sales Invoice', true);

        //     if($key == 51)
        //         break;
        // }

        // $orders = InconnectOrder::where('shopify_order_name','CAS20079')->first(); //259
        // $user = User::find($orders->user_id);
        // $orderResponse = $user->api()->rest('GET', '/admin/api/2023-10/orders/' . $orders->shopify_order_id . '.json');
        // $shopifyOrder = $orderResponse['body']['order'];
        // IntacctSalesOrderJob::dispatch($shopifyOrder, $orders, 'Sales Invoice', false, true);
















        

        //CHECKING IF ORDERS HAVE MISSING SALES ORDER OR SALES INVOICES PART. MEANS SHIPPING OR TAX PRODUCT IS MISSNG
        //6,23,95,215,202,40,37,209,48,231,117,38
        // $orders = InconnectOrder::
        // where('created_at', '>=', '2024-06-01 00:00:00')
        // ->where('fulfillment_status',"fulfilled")
        // ->whereNull('process')
        // // ->whereIn('user_id',[6, 23, 95, 215, 202, 40, 37, 209, 48, 231, 117, 38])
        // ->get();
        // foreach ($orders as $key => $inconnectOrder) {
        //     DetectMissingSalesOrderAndInvoices::dispatch($inconnectOrder);
        // }

        // CREATING SALES INVOICES WITH OLD LOGIC AND OLD TAX PRODUCT. IT WILL NEED SECOND SALES INVOICES TOO ######################
        // $orders = InconnectOrder::where('fulfillment_status', 'fulfilled')
        // ->whereNotNull('intact_sales_order_id')
        // ->whereNull('intact_sales_invoice_id')
        // ->whereNotNull('second_so_id')
        // ->whereNull('second_si_id')
        // ->get();
        // foreach ($orders as $key => $order) {
        //     $user = User::find($order->user_id);
        //     // logger($order->shopify_order_name);
        //     $orderResponse = $user->api()->rest('GET', '/admin/api/2023-10/orders/' . $order->shopify_order_id . '.json');
        //     $shopifyOrder = $orderResponse['body']['order'];
        //     // IntacctSalesOrderJob::dispatch($shopifyOrder, $order, 'Sales Invoice', true, false, true);
        //     IntacctSalesOrderJob::dispatch($shopifyOrder, $order, 'Sales Invoice', true, false, false);
        //     if($key == 100)
        //         break;
        // }

        // CREATING SALES INVOICES FOR REMAINING PRODUCTS. SECOND SALES ORDER IS ALREADY CREATED
        // $orders = InconnectOrder::where('fulfillment_status', 'fulfilled')
        // ->whereNotNull('intact_sales_order_id')
        // ->whereNotNull('intact_sales_invoice_id')
        // ->whereNotNull('second_so_id')
        // ->whereNull('second_si_id')
        // ->get();
        // foreach ($orders as $key => $inconnectOrder) {
        //     SecondInvoiceJob::dispatch($inconnectOrder);
        //     if($key == 100)
        //         break;
        // }

        
        // CREATING SALES INVOICES FOR SIMPLE ORDER, WHICH CONTAINS ONLY 1 SALES ORDER. 
        // $orders = InconnectOrder::where('fulfillment_status', 'fulfilled')
        // ->whereNotNull('intact_sales_order_id')
        // ->whereNull('intact_sales_invoice_id')
        // ->get();
        // foreach ($orders as $key => $order) {
        //     $user = User::find($order->user_id);
        //     $orderResponse = $user->api()->rest('GET', '/admin/api/2023-10/orders/' . $order->shopify_order_id . '.json');
        //     if(isset($orderResponse['body']['order'])) {
        //         logger("up: ".$order->shopify_order_name);
        //         $shopifyOrder = $orderResponse['body']['order'];
        //         IntacctSalesOrderJob::dispatch($shopifyOrder, $order, 'Sales Invoice', true, false, true);
        //     } else {
        //         logger($order->shopify_order_name);
        //     }
        //     // if($key == 5)
        //     //     break;
        // }

        // CREATING SALES ORDER FOR ORDERS WHO HAVE NO SALES ORDER NEITHER INVOICES
        // $orders = InconnectOrder::where('fulfillment_status', 'fulfilled')
        // ->whereNull('intact_sales_order_id')
        // ->whereNull('intact_sales_invoice_id')
        // ->get();
        // foreach ($orders as $key => $order) {
        //     $user = User::find($order->user_id);
        //     // logger($order->shopify_order_name);
        //     $orderResponse = $user->api()->rest('GET', '/admin/api/2023-10/orders/' . $order->shopify_order_id . '.json');
        //     $shopifyOrder = $orderResponse['body']['order'];
        //     IntacctSalesOrderJob::dispatch($shopifyOrder, $order, 'Sales Order', false, false, false);
        // }

        // CREATING SECOND SALES ORDER AND SECOND SALES INVOICES FOR ORDERS WHICH NEEDS BOTH
        // $orders = InconnectOrder::where('fulfillment_status', 'fulfilled')
        // ->where('process','INITIAL')
        // // ->whereNotNull('intact_sales_order_id')
        // // ->where('sales_invoice_check', true)
        // // ->where(function ($q) {
        // //     $q->where('sales_order_check', true);
        // // })
        // // ->select(['shopify_order_name','second_so_id','second_si_id','process'])
        // ->get();
        // foreach ($orders as $key => $order) {
        //     AddUpdateSalesOrderAndInvoice::dispatch($order);
        //     // if($key>=9)
        //     //     break;
        // }

        // ADDIND STATUS ALREADY_CONVERTED TO COLUMN PROCESS FOR SALES ORDERS THAT ARE ALREADY CONVERTED. LIST IS GIVEN MANUALLY
        // $orders = InconnectOrder::whereIn('intact_sales_order_id', [])
        // ->select(['shopify_order_name','second_so_id','second_si_id','process'])
        // ->get();
        // foreach ($orders as $key => $order) {
        //     logger(json_encode($order));
        //     $order->process = "ALREADY_CONVERTED";
        //     $order->save();  // Save the updated record to the database
        // }

        // MANAGING STATUSES
        // $orders = InconnectOrder::get();
        // $orders = InconnectOrder::where('fulfillment_status', 'fulfilled')->where(function ($q) {
        //     $q->where('process','PROCESSED_AGAIN');
        //     $q->orWhere('process', 'ALREADY_CONVERTED');
        // })->get();
        // foreach ($orders as $key => $order) {
        //     if($order->intact_sales_order_id) {
        //         $order->updates()->updateOrCreate([
        //             'name' => 'Intacct Sales Order',
        //             'type' => 'intacct_sales_order'
        //         ], [
        //             'initiated_at' => now(),
        //             'completed_at' => now(),
        //             'failed_at' => null,
        //         ]);
        //     } 
            
        //     if($order->intact_sales_invoice_id && $order->fulfillment_status == "fulfilled") {
        //         $order->updates()->updateOrCreate([
        //             'name' => 'Intacct Sales Invoice',
        //             'type' => 'intacct_sales_invoice'
        //         ], [
        //             'initiated_at' => now(),
        //             'completed_at' => now(),
        //             'failed_at' => null,
        //         ]);
        //     } else if($order->intact_sales_invoice_id){
        //         $order->updates()->updateOrCreate([
        //             'name' => 'Intacct Sales Invoice',
        //             'type' => 'intacct_sales_invoice'
        //         ], [
        //             'initiated_at' => now(),
        //             'completed_at' => now(),
        //             'failed_at' => null,
        //         ]);
        //     } else if(!$order->intact_sales_invoice_id && $order->fulfillment_status == "fulfilled") {
        //         $order->updates()->updateOrCreate([
        //             'name' => 'Intacct Sales Invoice',
        //             'type' => 'intacct_sales_invoice'
        //         ], [
        //             'initiated_at' => now(),
        //             'completed_at' => null,
        //             'failed_at' => now(),
        //         ]);
        //     }
            
        //     logger($order->shopify_order_name);
        // }

        // $this->updateOrderEntry("#1002", 1, 'realOrdersCreateJob',1345);

        // return OrderEntry::orderBy('id','desc')->get();

        // // UPDATING STATUS FOR Fulfilled from Shopify for orders who have idex_tracking_company and index_tracking_number not null START
        // $inconnectOrders = InconnectOrder::with('updates')
        // ->where('fulfillment_status','fulfilled')
        // ->whereNotNull('decorator_order_id')
        // ->whereNotNull('idex_tracking_company')
        // ->whereNotNull('idex_tracking_number')
        // ->whereHas('updates', function($q){
        //     $q->where('name', 'Fulfilled from Shopify');
        //     $q->whereNull('completed_at');
        // })->get();
        // $this->manageIdexStatusManually($inconnectOrders);

        // $inconnectOrders = InconnectOrder::with('updates')
        // ->where('fulfillment_status','fulfilled')
        // ->whereNotNull('decorator_order_id')
        // ->whereNotNull('idex_tracking_company')
        // ->whereNotNull('idex_tracking_number')
        // ->whereDoesntHave('updates', function($q){
        //     $q->where('name', 'Fulfilled from Shopify');
        // })->get();
        // $this->manageIdexStatusManually($inconnectOrders);

        // $inconnectOrders = InconnectOrder::with('updates')
        // ->where('fulfillment_status','fulfilled')
        // ->whereNotNull('decorator_order_id')
        // ->whereNotNull('idex_tracking_company')
        // ->whereNotNull('idex_tracking_number')
        // ->whereDoesntHave('updates', function($q){
        //     $q->where('name', 'Shipped from Idex');
        // })->get();
        // $this->manageIdexStatusManually($inconnectOrders);

        // $inconnectOrders = InconnectOrder::
        // where('fulfillment_status','fulfilled')
        // ->whereHas('updates', function($q){
        //     $q->where('name', 'Fulfilled from Shopify');
        //     $q->where('completed_at', NULL);
        // })->get();
        // $this->manageIdexStatusManually($inconnectOrders);
        // // UPDATING STATUS FOR Fulfilled from Shopify for orders who have idex_tracking_company and index_tracking_number not null END;



        //GET ORDERS WHOSE DECORATOR_ID, SECOND_DECORATOR_ID IS NOT NULL AND INTACCT_DECORATOR_ID IS NULL. CHANGE ITS STATUS TO FALSE USING COMMENT BELOW 
        //AND PLACE IDEX ORDER. ORDER CAN BE ALREADY CREATED MANUALLY BY IDEX. NEED TO MARK IT AS TRUE AS WELL.
        // $orders = InconnectOrder::
        // // where('shopify_order_name', "AVI1061")
        // whereNotNull('decorator_order_id')
        // ->whereNotNull('decorator_second_order_id')
        // ->whereNull('decorator_intacct_order_id')
        // ->get();

        // foreach ($orders as $key => $inconnectOrder) {

        //     // KEEP THIS COMMENT COMMENT
        //     // $inconnectOrder->decorator_sent = true;
        //     // $inconnectOrder->decorator_intact_sent = false;
        //     // $inconnectOrder->decorator_intacct_order_id = NULL;
        //     // $inconnectOrder->save();

        //     $user = User::find($inconnectOrder->user_id);
        //     $orderResponse = $user->api()->rest('GET', '/admin/api/2023-10/orders/' . $inconnectOrder->shopify_order_id . '.json');

        //     if(isset($orderResponse['body']['order'])) {
        //         $shopifyOrder = $orderResponse['body']['order'];
        //         $order = $this->graphQLOrderResponse($inconnectOrder->shopify_order_id, $user);
        //         $gooselyRule = $this->gooselyRuleProcess($order);
        //         $order = json_decode(json_encode($order), true);
        //         $order['original'] = $order;
        //         $order = json_decode(json_encode($order), true);
        //         $order['original'] = $order;
        //         $this->decideDecorator($user, $shopifyOrder, $inconnectOrder, $order, $gooselyRule);
        //     } else {
        //         logger("This user is uninstalled or needs update" . json_encode($user));
        //     }
        // }

        // GET ORDER IN GRAPHQL RESPONSE. HANDLING LINE ITEMS MORE THAN 250
        // $order = InconnectOrder::find(9029);
        // $user = User::find($order->user_id);
        // $orderResponse = $user->api()->rest('GET', '/admin/api/2023-10/orders/' . $order->shopify_order_id . '.json');
        
        // if (isset($orderResponse['body']['order'])) {
        //     $shopifyOrder = $orderResponse['body']['order'];
        //     return $order = $this->graphQLOrderResponse($order->shopify_order_id, $user);
        // }

        //RESTARTING ORDERS IF NECESSARY. BELOW ARE THE ORDERS THAT ARE SENT BUT DOESN'T HAVE INCONNECT ORDER OR ITS ID 
        // $orders = OrderEntry::
        // whereNotNull('ordersCreateJob')
        // ->whereNotNull('order_name')
        // ->whereNotNull('realOrdersCreateJob')
        // ->whereNull('inconnect_order_id')
        // ->join(DB::connection('all_in_one_conn')->raw('sbszypvdax.users'),'users.id','=','order_entries.user_id')
        // ->leftJoin('inconnect_accounts','inconnect_accounts.user_id','=', DB::connection('all_in_one_conn')->raw('sbszypvdax.users').'.id')
        // ->whereNotNull('inconnect_accounts.id')
        // ->where('users.name','!=','hitt-brand-shop.myshopify.com')
        // ->where('users.name','!=','ccuretail.myshopify.com')
        // // ->whereNull('inconnect_accounts.id')
        // ->select(['order_entries.*','users.id','users.name','inconnect_accounts.id as inc'])
        // // ->select(['inconnect_accounts.id as inc_id','users.name','users.id','order_entries.order_name'])
        // //  ->select(['order_entries.order_name'])
        // // ->get();
        // ->get()->pluck('order_name')->unique()->values();

        //BELOW ARE THE ORDERS THAT ARE SENT BUT DOESN'T HAVE INCONNECT ORDER OR ITS ID 
        return $orders = OrderEntry::
        whereNotNull('ordersCreateJob')
        ->whereNotNull('order_name')
        ->whereNotNull('realOrdersCreateJob')
        ->whereNotNull('inconnect_order_id')
        ->whereNull('intacctSalesOrderJobSales')
        ->get();
    }

    public function addAttachmentParent()
    {
        // return $this->addAttachment($fileName, $extension, $base64File);
    }

    public function screenPro()
    {
        // ScreenProJob::dispatchSync();

        $access_token = $this->getSPAccessToken();
        $response = Http::withToken($access_token)->get('https://manageordersapi.com/onsite/order-pull',[
            "date_from" => "2024-08-22",
            "date_to" => "2024-08-22",
        ]);
        $data = $response->json();
        return $data;

        // // Example usage
        // $quantity = 4; // Quantity input
        // $stitchCount = 12001; // Stitch count input

        // return $price = $this->calculateSPPrice($quantity, $stitchCount);
    }

    public function adjustImage() 
    {
        $filePath = public_path('images/2.jpg');
        return $this->adjustCropicaImage($filePath);
    }
}
