<?php

namespace App\Models\Punchout;

use App\Services\Punchout\PomwGatewayClientConfirmedOrderFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Services\Punchout\OrderTransferRoutine;

class PomwGatewayClientOrder extends Model
{
    use HasFactory;

    protected $connection = 'punchout_conn';

    public function pomw_order_items()
    {
        return $this->hasMany(PomwGatewayClientOrderItem::class, 'order_id', 'id');
    }

    public function pomw_client()
    {
        return $this->belongsTo(PomwGatewayClient::class, 'client_id', 'id');
    }

    public function pomw_customer()
    {
        return $this->belongsTo(PomwGatewayClientCustomer::class, 'customer_id', 'id');
    }

    public function pomw_session()
    {
        return $this->belongsTo(PomwGatewayClientCustomerPunchoutSession::class, 'session_id', 'id');
    }

    public function pomw_confirmed_order()
    {
        return $this->hasOne(PomwGatewayClientConfirmedOrder::class, 'order_id', 'id');
    }

    public function journals()
    {
        return $this->hasMany(CoreObjectJournalEntry::class, 'journal_id', 'journal_id');
    }

    public function objectJournal()
    {
        return $this->belongsTo(CoreObjectJournal::class, 'journal_id');
    }

    public function getJournal()
    {
        if ($this->journal_id)
            return $this->objectJournal;

        $journal = new CoreObjectJournal();
        $journal->setParentKey("GatewayClientOrder_" . $this->id);
        $journal->save();

        $this->journal_id = $journal->id;
        $this->save();

        return $journal;
    }

    public function addJournalEntry($data, $type = 'info', $key = '')
    {
        $journal = $this->getJournal();
        $journal->addEntry($data, $key);
    }

    public function getConfirmedOrder()
    {
        $confirmed_order = PomwGatewayClientConfirmedOrder::whereOrderId($this->id)->first();
        return $confirmed_order;
    }

    public function createConfirmedOrder($xml)
    {
        $factory = new PomwGatewayClientConfirmedOrderFactory($this, $xml);
        $confirmed_order = $factory->createConfirmedOrder();

        if ($confirmed_order) {
            $this->addJournalEntry('Created Confirmed Order: ' . $confirmed_order->id);

            $this->confirmed_order_total = $confirmed_order->total;

            if ($this->total == $confirmed_order->total) {
                $this->confirmed_order_total_matches = 1;
            } else {
                $this->confirmed_order_total_matches = 0;
            }
            $this->save();
        }
    }

    public function sendToShopify($xml)
    {
        $this->addJournalEntry('Delivering Shopify Order...');

        $routine = new OrderTransferRoutine($this);

        [$order_id, $shopify_order_id] = $routine->doTransfer($xml);

        if ($order_id)
        {
            $note = 'Delivery : Shopify Ok ('.$order_id.')';

            $this->is_delivered = 1;
            $this->status_id = 2;
            $this->magento_order_id = $order_id;
            $this->shopify_order_id = $shopify_order_id;
            $this->save();

            $this->addJournalEntry($note);
            $this->addJournalEntry('Delivered ');
        }
        else
        {
            $this->status_id = 3; //undelivered
            $this->save();
            $this->addJournalEntry("Error delivering to Shopify");
        }
    }
    public function getIncomingRequest()
    {
        $session = $this->pomw_session;

        if ($session) {
            $request = PomwGatewayClientRequest::whereCustomerSessionId($session->id)->whereType('IncomingOrderRequest')->first();
            return $request;
        }

        return null;
    }

    public function getIncomingRequestData()
    {
        $request = $this->getIncomingRequest();

        if (!empty($request)) {
            $data = $request->request_data;

            return $data;
        }

        return null;
    }

    public function getContact()
    {
        $xml = $this->getIncomingRequestXml();

        if (isset($xml->Request->OrderRequest->OrderRequestHeader->Contact)) {
            return $xml->Request->OrderRequest->OrderRequestHeader->Contact;
        }

        return "";
    }

    public function getIncomingRequestXml()
    {
        $xml = simplexml_load_string($this->getIncomingRequestData());
        return $xml;
    }

    public function recalculateTotal()
    {
        $items = $this->items;

        $total = 0;

        foreach ($items as $item) {
            $total += $item->quantity * $item->unit_price;
        }

        $this->total = ($total + $this->shipping_total + $this->tax_total);
        $this->save();

        $this->addJournalEntry('Recalculated total: ' . $this->total);
    }

    public function getShippingAddress()
    {
        $xml = $this->getIncomingRequestXml();

        if (isset($xml->Request->OrderRequest->OrderRequestHeader->ShipTo->Address)) {
            return $xml->Request->OrderRequest->OrderRequestHeader->ShipTo->Address;
        }

        return "";
    }

    public function getBillingAddress()
    {
        $xml = $this->getIncomingRequestXml();

        if (isset($xml->Request->OrderRequest->OrderRequestHeader->BillTo->Address)) {
            return $xml->Request->OrderRequest->OrderRequestHeader->BillTo->Address;
        }

        return "";
    }

    public function getVisibleId()
    {
        return $this->getExternalIdIfAbleIfNotGetInternalId();
    }

    public function getExternalIdIfAbleIfNotGetInternalId()
    {
        return !empty($this->external_id) ? $this->external_id : $this->internal_id;
    }

}
