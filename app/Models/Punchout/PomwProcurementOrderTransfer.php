<?php

namespace App\Models\Punchout;

use App\Traits\Punchout\CxmlFactory;
use DateTime;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PomwProcurementOrderTransfer extends Model
{
    use HasFactory, CxmlFactory;

    protected $table = 'pomw_procurement_order_transfer';
    protected $connection = 'punchout_conn';

    public function order()
    {
        return $this->belongsTo(PomwProcurementOrder::class, 'order_id');
    }

    public function status()
    {
        return $this->belongsTo(PomwProcurementOrderTransferStatus::class, 'status_id');
    }

    public function attempt()
    {
        $request = request();
        $order = $this->order;
        $catalog = $order->catalog;

        $session = $order->session;
        $address = $session->address;
        $payload_id = $this->getPayloadId();
        $payload_timestamp = date(DateTime::RFC3339, time());
        $shipping_address = $address;
        $billing_address = $address;
        $items = $order->items;
        $user = $order->user;

        $cxml = view('cxmls.punchout_order_request', compact(
            'order',
            'catalog',
            'shipping_address',
            'billing_address',
            'user',
            'items',
            'payload_id',
            'payload_timestamp'
        ))->render();

        $response = Http::withBody($cxml, 'application/xml')->post($catalog->order_transfer_url);
        $response_cxml = $response->body();
        if (str_contains($response_cxml, '<Status code="200" text="Ok">')) {
            $catalog_request = new PomwCatalogRequest();
            $catalog_request->uuid = Str::uuid();
            $catalog_request->catalog_id = $catalog->id;
            $catalog_request->user_id = $session->user_id;
            $catalog_request->type = "OrderTransferSuccess";
            $catalog_request->operation = "transfer-success";
            $catalog_request->payload_ident = $this->getPayloadId();
            $catalog_request->data_headers = getHeadersAsString();
            $catalog_request->uri = $request->getPathInfo();
            $catalog_request->user_agent = $request->userAgent();
            $catalog_request->remote_host = $request->getClientIp();
            $catalog_request->request_data = $cxml;
            $catalog_request->response_body = $response_cxml;
            $catalog_request->save();

            $this->status_id = 2;
            $this->save();

            $approval = $order->approval;
            $approval->delivered = 1;
            $approval->save();

            $order->delivered = 1;
            $order->save();
        } else {
            $error = [
                'msg' => 'Error loading cxml from ' . $catalog->order_transfer_url,
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
            $catalog_request->user_id = $session->user_id;
            $catalog_request->type = "OrderTransferError";
            $catalog_request->operation = "transfer-failed";
            $catalog_request->payload_ident = $this->getPayloadId();
            $catalog_request->data_headers = getHeadersAsString();
            $catalog_request->uri = $request->getPathInfo();
            $catalog_request->user_agent = $request->userAgent();
            $catalog_request->remote_host = $request->getClientIp();
            $catalog_request->request_data = $cxml;
            $catalog_request->response_body = $response_cxml;
            $catalog_request->error = json_encode($error);
            $catalog_request->save();

            $this->status_id = 3;
            $this->save();
        }
    }
}
