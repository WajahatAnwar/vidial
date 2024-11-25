<?php

namespace App\Models\Punchout;

use App\Traits\Punchout\JournaledModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class PomwGatewayClientInvoice extends Model
{
    use HasFactory, JournaledModelTrait;

    protected $connection = 'punchout_conn';

    protected $appends = [
        'can_be_pushed'
    ];

    public function order()
    {
        return $this->belongsTo(PomwGatewayClientOrder::class, 'order_id', 'id');
    }

    public function client()
    {
        return $this->belongsTo(PomwGatewayClient::class, 'client_id', 'id');
    }

    public function status()
    {
        return $this->belongsTo(PomwGatewayClientInvoiceStatus::class, 'status_id', 'id');
    }

    public function items()
    {
        return $this->hasMany(PomwGatewayClientInvoiceItem::class, 'invoice_id', 'id');
    }
    public function recalculateTotalAndSubtotals()
    {
        $this->recalculateTotal();
    }

    private function recalculateTotal()
    {
        $total = $this->items->sum(function ($item) {
            return $item->quantity * $item->unit_price;
        });

        $this->subtotal = $total;
        $this->total = $total + $this->shipping + $this->tax;
        $this->save();
    }
    public function getRequests()
    {
        $requests = $this->order->pomw_session->pomw_client_request;
        $invoiceRequests = collect($requests)->filter(function ($request) {
            return in_array($request->type, ['IncomingMagentoInvoice', 'InvoicePush']);
        });
        return $invoiceRequests->values()->toArray();
    }
    public function isCreditMemo()
    {
        return $this->purpose === 'creditMemo';
    }
    public function getTotal()
    {
        if ($this->isCreditMemo() && $this->order->pomw_client->pomw_client_network->isUnimarket()) {
            return $this->total <= 0 ? $this->total : -$this->total;
        }

        if ($this->isCreditMemo() && $this->order->pomw_client->shouldCreditMemoAmountsBeNegative()) {
            return $this->total <= 0 ? $this->total : -$this->total;
        }

        return $this->total;
    }
    public function getTax()
    {
        if ($this->isCreditMemo() && $this->order->pomw_client->pomw_client_network->isUnimarket()) {
            return $this->tax <= 0 ? $this->tax : -$this->tax;
        }

        if ($this->isCreditMemo() && $this->order->pomw_client->shouldCreditMemoAmountsBeNegative()) {
            return $this->tax <= 0 ? $this->tax : -$this->tax;
        }

        return $this->tax;
    }
    public function getSubtotal()
    {
        if ($this->isCreditMemo() && $this->order->pomw_client->pomw_client_network->isUnimarket()) {
            return $this->subtotal <= 0 ? $this->subtotal : -$this->subtotal;
        }

        if ($this->isCreditMemo() && $this->order->pomw_client->shouldCreditMemoAmountsBeNegative()) {
            return $this->subtotal <= 0 ? $this->subtotal : -$this->subtotal;
        }

        return $this->subtotal;
    }
    public function hasTaxLocation()
    {
        if ($this->order->pomw_client->isTaxFree())
            return false;

        return !empty($this->getTaxLocation());
    }
    public function getTaxLocation()
    {
        $address = $this->order->pomw_session->pomw_street_address;

        if (!empty($address))
            return $address->state;

        return "";
    }
    public function getTaxPercentageRate()
    {
        if ($this->order->pomw_client->isTaxFree())
            return 0;

        if ($this->tax <= 0)
            return 0;

        $tax_rate = $this->tax / $this->getTaxableAmount() * 100;

        return round($tax_rate, 2);
    }
    public function getTaxableAmount()
    {
        if ($this->order->pomw_client->isTaxFree())
            return 0;

        return $this->getSubtotal() + $this->shipping;
    }
    public function getTaxCalculationDate()
    {
        $timestamp = $this->order->created_at;

        if (!is_int($timestamp))
            $timestamp = strtotime($timestamp);

        return date('Y-m-d', $timestamp);
    }
    public function getShipping()
    {
        if ($this->isCreditMemo() && $this->order->pomw_client->shouldCreditMemoAmountsBeNegative()) {
            return $this->shipping <= 0 ? $this->shipping : -$this->shipping;
        }
        return $this->shipping;
    }

    public function getCanBePushedAttribute()
    {
        if ($this->order->pomw_client?->isInvoicePushEnabled()) {
            $status_uri = $this->status->uri;
            if ($status_uri == 'test' || $status_uri == 'undelivered' || $status_uri == 'new') {
                return true;
            }
        }
        return false;
    }

    private function changeStatus($uri)
    {
        $status = PomwGatewayClientInvoiceStatus::where('uri', $uri)->first();
        $this->status_id = $status->id;
        $this->save();
    }

    public function push()
    {
        $this->changeStatus('in_transit');
        Log::debug('push started for invoice: ' . $this->id);
        $order = $this->order;
        $client = $this->order->pomw_client;
        if (!$client?->isInvoicePushEnabled()) {
            $this->addErrorToJournal('Push failed: Client Invoice Disabled');
            $this->changeStatus('undelivered');
            return false;
        }
        $url = $client->invoice_receiver_url;

        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            $this->addErrorToJournal('Push failed: No Invoice Receiver URL set up');
            $this->changeStatus('undelivered');
            return false;
        }

        $session = $order->pomw_session;

        $cxml = $this->getGeneratedCXML();
        $this->pushed_cxml = $cxml;
        $this->save();

        Log::debug('cxml_constructed' . 'invoice_debug');

        $response = $this->sendCurlRequest((string) $url, $cxml, $client, $order);

        $xml = simplexml_load_string($response);

        if ($xml === false || !isset($xml->Response->Status)) {
            $this->changeStatus('undelivered');
            $this->addErrorToJournal('XML Parse Error');
            return false;
        } else {
            $this->addSuccessToJournal('Transfer response was parsed successfully');
        }

        $code = (string) $xml->Response->Status->attributes()->code;

        $this->addSuccessToJournal('Response Code is:' . $code);

        if (substr($code, 0, 1) === '2') {
            $this->changeStatus('delivered');
            $this->addSuccessToJournal('Delivered');
            if (isset($xml->Response->Status)) {
                $this->addSuccessToJournal($xml->Response->Status);
            }
        } else {
            $this->changeStatus('undelivered');
            $this->addErrorToJournal($xml->Response->Status);
            return false;
        }
        return true;
    }
    private function sendCurlRequest($url, $cxml, $client, $order)
    {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $cxml);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/xml']);
        $response = curl_exec($ch);
        curl_close($ch);
        $request = new PomwGatewayClientRequest();
        $request->client_id = $client->id;
        $request->customer_session_id = $order->pomw_session->id;
        $request->request_data = $this->pushed_cxml;
        $request->response_body = $response;
        $request->response_code = curl_getinfo($ch, CURLINFO_HTTP_CODE); // Fixed line
        $request->response_headers = curl_getinfo($ch, CURLINFO_HEADER_OUT); //$ch->getHeader();
        $request->save();
        Log::debug('invoice_sent');
        return $response;
    }

    public function getGeneratedCXML()
    {
        $invoice = $this;
        $order = $invoice->order;
        $session = $order->pomw_session;
        $items = $invoice->items;
        $client = $order->pomw_client;

        $payload_timestamp = now()->toRfc3339String();
        $payload_id = $session->getPayloadId() . "@" . env('APP_URL');
        $invoice_timestamp = $invoice->created_at->toRfc3339String();

        $data = [
            'payload_id' => $payload_id,
            'payload_timestamp' => $payload_timestamp,
            'client' => $client,
            'session' => $session,
            'invoice_timestamp' => $invoice_timestamp,
            'invoice' => $invoice,
            'order' => $order,
            'items' => $items,
        ];

        if ($client->pomw_client_network->isAriba()) {
            $shipping_address = $order->pomw_confirmed_order->shipping_address;
            if ($shipping_address) {
                $data['shipping_address'] = $shipping_address;
            }
            $billing_address = $order->pomw_confirmed_order->billing_address;
            if ($billing_address) {
                $data['billing_address'] = $billing_address;
            }
        }

        if ($invoice->isCreditMemo()) {
            $first_invoice = PomwGatewayClientInvoice::where('purpose', 'standard')
                ->where('order_id', $order->id)
                ->orderBy('id', 'asc')
                ->first();
            if ($first_invoice) {
                $data['first_invoice'] = $first_invoice;
            }
        }
        $cxml = view('cxmls.simulated_invoice_cxml', $data)->render();
        return $cxml;
    }

}
