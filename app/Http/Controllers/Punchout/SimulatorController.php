<?php

namespace App\Http\Controllers\Punchout;

use App\Http\Controllers\Controller;
use App\Models\Punchout\PomwCatalog;
use App\Models\Punchout\PomwCatalogRequest;
use App\Models\Punchout\PomwGatewayClient;
use App\Models\Punchout\PomwProcurementOrder;
use App\Models\Punchout\PomwProcurementOrderApproval;
use App\Models\Punchout\PomwProcurementOrderItem;
use App\Models\Punchout\PomwProcurementStreetAddress;
use App\Models\Punchout\PomwPunchoutSession;
use App\Traits\Punchout\CxmlFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use SebastianBergmann\CodeCoverage\Report\PHP;

class SimulatorController extends Controller
{
    use CxmlFactory;

    public function indexCatalogs()
    {
        $street_addresses = PomwProcurementStreetAddress::all();
        return inertia('Applications/Punchout/Simulator/Simulator', compact('street_addresses'));
    }

    public function indexOrders()
    {
        return inertia('Applications/Punchout/Simulator/Simulator');
    }

    public function getCatalogs(Request $request)
    {
        $catalogs = PomwCatalog::selectRaw('pomw_catalogs.id, pomw_catalogs.name as client_name, domain, network_id, pomw_procurement_networks.name as network_name, pomw_catalogs.uuid, pomw_catalogs.punchout_url')
            ->leftJoin('pomw_procurement_networks', 'network_id', '=', 'pomw_procurement_networks.id')->when($request->get('q'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->where('pomw_catalogs.id', 'LIKE', '%' . $request->q . '%')
                        ->orWhereRaw('LOWER(pomw_catalogs.name) LIKE ?', ['%' . strtolower($request->q) . '%'])
                        ->orWhereRaw('LOWER(domain) LIKE ?', ['%' . strtolower($request->q) . '%'])
                        ->orWhereRaw('pomw_procurement_networks.name LIKE ?', ['%' . strtolower($request->q) . '%']);
                });
            })->when($request->get('sort'), function ($q) use ($request) {
                $q->orderBy(...explode(' ', $request->get('sort')));
            })->cursorPaginate($request->page_count);

        return sendResponse(true, 'Catalogs retrieved successfully!', $catalogs);
    }

    public function getOrders(Request $request)
    {
        $all_in_one_db =  DB::connection('all_in_one_conn')->getDatabaseName();
        $catalogs = PomwProcurementOrder::selectRaw('pomw_procurement_orders.id, internal_id, users.name as user_name, pomw_procurement_orders.uuid, pomw_catalogs.name as catalog_name, total, (DATE_FORMAT(pomw_procurement_orders.created_at, "%a, %d %b %Y %H:%i:%s ")) as created_time')
            ->leftJoin('pomw_catalogs', 'pomw_catalogs.id', '=', 'pomw_procurement_orders.catalog_id')
            ->leftJoin($all_in_one_db . '.users', 'users.id', '=', 'pomw_procurement_orders.user_id')->when($request->get('q'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->where('pomw_procurement_orders.id', 'LIKE', '%' . $request->q . '%')
                        ->orWhereRaw('internal_id LIKE ?', ['%' . $request->q . '%'])
                        ->orWhereRaw('LOWER(users.name) LIKE ?', ['%' . strtolower($request->q) . '%'])
                        ->orWhereRaw('pomw_catalogs.name LIKE ?', ['%' . strtolower($request->q) . '%'])
                        ->orWhereRaw('total LIKE ?', ['%' . $request->q . '%'])
                        ->orWhereRaw('DATE_FORMAT(pomw_procurement_orders.created_at, "%a, %d %b %Y %H:%i:%s ") LIKE ?', ['%' . $request->q . '%']);
                });
            })->when($request->get('sort'), function ($q) use ($request) {
                $q->orderBy(...explode(' ', $request->get('sort')));
            })->cursorPaginate($request->page_count);

        return sendResponse(true, 'Orders retrieved successfully!', $catalogs);
    }

    public function startPunchout(Request $request, $id)
    {
        $input_address = $request->input('a');
        $address = PomwProcurementStreetAddress::whereUuid($input_address)->first();
        $user = auth()->user();
        $catalog = PomwCatalog::whereUuid($id)->whereAccountId(1)->first();

        $session = new PomwPunchoutSession();
        $session->uuid = Str::uuid();
        $session->user_id = $user->id;
        $session->catalog_id = $catalog->id;
        $session->address_id = $address->id;
        $session->token = bin2hex(\random_bytes(32));
        $session->buyer_cookie = $user->uuid;
        $session->save();

        // save punchout session
        $factory = $this;

        $cxml = view('cxmls.punchout_setup_request', compact('factory', 'session', 'address', 'catalog', 'user'))->render();
        $punchout_url = $catalog->punchout_url;
        if (str_contains(url()->current(), 'localto.net') || str_contains(url()->current(), '127.0.0.1')) {
            $punchout_url = str_replace(env('APP_URL'), 'http://clubcolors.test', $catalog->punchout_url);
        }
        $response = Http::withBody($cxml, 'application/xml')->post($punchout_url);
        $response_cxml = $response->body();
        if (!str_contains($response_cxml, 'cxml')) {

            // convert the above according to laravel http client
            $error = [
                'msg' => 'Error loading cxml from ' . $catalog->punchout_url,
                'response' => $response_cxml,
                'request' => $cxml,
                'latency' => $response->transferStats->getTransferTime() * 1000,
                'address' => url()->current(),
                'error' => $response->transferStats->getHandlerErrorData(),
                'connect_timeout' => null,
            ];


            $catalog_request = new PomwCatalogRequest();
            $catalog_request->uuid = Str::uuid();
            $catalog_request->catalog_id = $catalog->id;
            $catalog_request->user_id = $user->id;
            $catalog_request->type = "PunchOutSetupError";
            $catalog_request->operation = "session-cancelled";
            $catalog_request->payload_ident = $this->getPayloadId();
            $catalog_request->data_headers = getHeadersAsString();
            $catalog_request->uri = $request->getPathInfo();
            $catalog_request->user_agent = $request->userAgent();
            $catalog_request->remote_host = $request->getClientIp();
            $catalog_request->request_data = $cxml;
            $catalog_request->response_body = $response_cxml;
            $catalog_request->error = $error;
            $catalog_request->save();
            return;
        }

        $catalog_request = new PomwCatalogRequest();
        $catalog_request->uuid = Str::uuid();
        $catalog_request->catalog_id = $catalog->id;
        $catalog_request->user_id = $user->id;
        $catalog_request->type = "PunchOutSetupRequest";
        $catalog_request->operation = "create";
        $catalog_request->payload_ident = $this->getPayloadId();
        $catalog_request->data_headers = getHeadersAsString();
        $catalog_request->uri = $request->getPathInfo();
        $catalog_request->user_agent = $request->userAgent();
        $catalog_request->remote_host = $request->getClientIp();
        $catalog_request->request_data = $cxml;
        $catalog_request->response_body = $response_cxml;
        $catalog_request->save();

        $xml = simplexml_load_string($response_cxml);
        $url = (string)$xml->Response->PunchOutSetupResponse->StartPage->URL;

        if (!filter_var($url, FILTER_VALIDATE_URL) === FALSE) {
            $catalog_request = new PomwCatalogRequest();
            $catalog_request->uuid = Str::uuid();
            $catalog_request->catalog_id = $catalog->id;
            $catalog_request->user_id = $user->id;
            $catalog_request->type = "PunchOutRedirect";
            $catalog_request->operation = "redirect";
            $catalog_request->response_body = $response;
            $catalog_request->payload_ident = $this->getPayloadId();
            $catalog_request->data_headers = getHeadersAsString();
            $catalog_request->uri = $request->getPathInfo();
            $catalog_request->user_agent = $request->userAgent();
            $catalog_request->remote_host = $url;
            $catalog_request->request_data = "";
            $catalog_request->save();
            return redirect($url);
        }

        return sendResponse(true, 'Punchout started successfully!', $response->json());
    }

    public function punchin(Request $request, $id)
    {
        $session = PomwPunchoutSession::whereUuid($id)->first();
        $input_cxml = $request->input('cxml-base64');
        $cxml = base64_decode($input_cxml);
        $xml = simplexml_load_string($cxml);


        $buyer_cookie = (string)$xml->Message->PunchOutOrderMessage->BuyerCookie;

        if (!$buyer_cookie || $buyer_cookie != $session->buyer_cookie) {
            return sendResponse(false, 'Invalid buyer cookie!', null, 400);
        }

        $total = $xml->Message->PunchOutOrderMessage->PunchOutOrderMessageHeader->Total->Money;
        $total_shipping = $xml->Message->PunchOutOrderMessage->PunchOutOrderMessageHeader->Shipping->Money;
        $total_tax = $xml->Message->PunchOutOrderMessage->PunchOutOrderMessageHeader->Tax->Money;

        $ship_method = $xml->Message->PunchOutOrderMessage->PunchOutOrderMessageHeader->Shipping->Description;

        $items = $xml->xpath('//Message/PunchOutOrderMessage/ItemIn');

        $user = $session->user;
        $catalog = $session->catalog;

        $order = new PomwProcurementOrder();
        $order->uuid = Str::uuid();
        $order->user_id = $user->id;
        $order->account_id = 1;
        $order->catalog_id = $catalog->id;
        $order->session_id = $session->id;
        $order->total = $total;
        $order->shipping_total = $total_shipping;
        $order->shipping_method = $ship_method;
        $order->tax_total = $total_tax;
        $order->remote_ip = $request->getClientIp();

        $total_procurement_orders = $catalog->procurement_orders()->count();
        $total_procurement_orders = str_pad($total_procurement_orders, 8, '0', STR_PAD_LEFT);
        $order->internal_id = $catalog->id . $total_procurement_orders;

        $order->save();

        foreach ($items as $key => $item) {
            $order_item = new PomwProcurementOrderItem();
            $order_item->uuid = Str::uuid();
            $order_item->order_id = $order->id;
            $order_item->quantity = $item->attributes()->quantity;
            $order_item->supplier_part_id = $item->ItemID->SupplierPartID;
            $order_item->supplier_auxiliary_id = $item->ItemID->SupplierPartAuxiliaryID;
            $order_item->description = $item->ItemDetail->Description;
            $order_item->unit_of_measure = $item->ItemDetail->UnitOfMeasure;
            $order_item->unit_price = $item->ItemDetail->UnitPrice->Money;
            $order_item->classification = $item->ItemDetail->Classification;
            $order_item->manufacturer_name = $item->ItemDetail->ManufacturerName;
            $order_item->leadtime = $item->ItemDetail->LeadTime;
            $order_item->save();
        }

        $session->completed = 1;
        $session->save();
        return redirect()->route('punchout.simulator.orders', ['order_id' => $order->uuid->__toString()]);
    }

    public function getOrder($id)
    {
        $order = PomwProcurementOrder::whereUuid($id)->with('items', 'catalog', 'user')->firstOrFail();
        return responseJson(true, 'Order retrieved successfully!', $order);
    }

    public function updateStatus(Request $request, $id)
    {
        $user = auth()->user();
        $validator = validator($request->all(), [
            'approve' => 'required'
        ]);
        if ($validator->fails()) {
            return responseJson(false, $validator->errors()->first(), null, null, 422);
        }
        $order = PomwProcurementOrder::whereUuid($id)->firstOrFail();
        $approval = PomwProcurementOrderApproval::whereOrderId($order->id)->first();

        if ($approval) {
            return sendResponse(false, 'Already reviewed for approval!', null, 400);
        }

        $approval = new PomwProcurementOrderApproval();
        $approval->uuid = Str::uuid();
        $approval->order_id = $order->id;
        $approval->account_id = $order->account_id;
        $approval->approver_id = $user->id;
        $approval->note = 'Approved by admin';
        $approval->is_approved = $request->input('approve');
        $approval->delivered = 0;
        $approval->save();

        $order->approval_id = $approval->id;
        $order->save();
        if ($approval->is_approved === 1) {
            $order->attemptDeliveryIfNeeded();
        }
        return sendResponse(true, 'Order status updated successfully!', $approval);
    }
}
