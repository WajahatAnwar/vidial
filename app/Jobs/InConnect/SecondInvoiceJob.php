<?php

namespace App\Jobs\InConnect;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\AllInOne\User;
use App\Traits\InConnect\IdexTrait;
use App\Traits\InConnect\IntacctTrait;
use Carbon\Carbon;

class SecondInvoiceJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, IdexTrait, IntacctTrait;

    public $timeout = 600;
    public $tries = 2;

    private $inconnectOrder;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($inconnectOrder)
    {
        $this->onQueue('que_free');
        $this->inconnectOrder = $inconnectOrder;
    }

    private function salesJobInside($data, $inconnectOrder, $type = 'Sales Order', $line_items, $invoice_id = "")
    {
        $user = $inconnectOrder->user;
        $payload = json_decode(json_encode($data), true);
        $inconnect_account = $user->inconnect_account;
        $attributes = collect($payload['note_attributes']);
        $po_number = $attributes->whereIn('name', ['Purchase Order ID', 'PO ID'])->first();
        $payload['customer_id'] = $inconnect_account->intact_customer->customer_id;
        $payload['reference_no'] = $payload['name'];
        $payload['due_date'] = Carbon::now()->addDays(15)->format('Y-m-d');
        $payload['message'] = 'Order from Shopify';
        $payload['department_id'] = $inconnect_account->intact_department->department_id;
        $payload['customer_po'] = @$po_number['value'];
        $payload['class_id'] = $inconnect_account->intact_class->class_id;
        $payload['location_id'] = 'Club Colors';
        $payload['term_name'] = $inconnect_account->intact_payment_term->name;
        // intact customer
        $payload['company_id'] = $inconnect_account->intact_customer->customer_id;
        $payload['company_name'] = $inconnect_account->intact_customer->name;
        $payload['line_items'] = $line_items;
        $key = 'intact_sales_order_id';
        if ($type == 'Sales Invoice') {
            $key = 'intact_sales_invoice_id';
            $payload['intact_so_number'] = str_replace('&', '&amp;', $invoice_id);
            $payload['document_no'] = explode('-', $invoice_id)[1];
        }

        $orderDone = $this->createSalesOrder($user, $payload, $type, "goosely", "other");
        // logger()->info(json_encode($orderDone));

        if (isset($orderDone['operation']['result']['key'])) {
            $inconnectOrder->second_si_id = $orderDone['operation']['result']['key'];
            $inconnectOrder->save();
        } else {
            if(strpos(@$orderDone['operation']['result']['errormessage']['error']['description2'], "is already converted") !== false) {
                // logger("is already converted");

                $inconnectOrder->update([
                    'second_si_id' => "Sales Invoice-" . explode('-', $inconnectOrder->second_so_id)[1],
                ]);
            }
        }
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $inconnectOrder = $this->inconnectOrder;
        // logger(json_encode($inconnectOrder));

        $user = User::find($inconnectOrder->user_id);
        $inconnect_account = $user->inconnect_account;
        $shopifyOrder = $user->api()->rest('GET', 'admin/api/2024-04/orders/' . $inconnectOrder->shopify_order_id . '.json');
        $shopifyOrder = $shopifyOrder['body']->order;
        $shopifyOrderPayload = $shopifyOrder;

        $shopifyOrderPayload['department_id'] = $inconnect_account->intact_department->department_id;
        $shopifyOrderPayload['class_id'] = $inconnect_account->intact_class->class_id;
        $shopifyOrderPayload['location_id'] = 'Club Colors';

        $line_items_si = [];
        $existing_sales_invoice = $this->getExistingSalesOrderOrInvoice($inconnectOrder->intact_sales_invoice_id, "Sales Invoice");
        // logger(json_encode($existing_sales_invoice));

        //SHIPPING PRODUCT CHECK FOR SI
        $si_shipping = @$existing_sales_invoice['operation']['result']['data']['SODOCUMENT']['SODOCUMENTENTRIES']['sodocumententry'];
        if (isset($si_shipping['ITEMID'])) {
            if (strpos($si_shipping['ITEMID'], 'SHIP001') === false)
                $si_shipping = null;
        } elseif (is_array($si_shipping)) {
            $si_shipping = collect($si_shipping);
            $si_shipping = $si_shipping->filter(function ($item) {
                return strpos($item['ITEMID'], 'SHIP001') !== false;
            })->first();
        }
        // logger(json_encode($si_shipping));
        if ((float) $shopifyOrderPayload['total_shipping_price_set']['shop_money']['amount'] > 0 && !$si_shipping) {
            $line_items_si[] = [
                'item_id' => 'SHIP001',
                'quantity' => 1,
                'price' => $shopifyOrderPayload['total_shipping_price_set']['shop_money']['amount'],
                'location_id' => $shopifyOrderPayload['location_id'],
                'department_id' => $shopifyOrderPayload['department_id'],
                'class_id' => $shopifyOrderPayload['class_id'],
            ];
        }

        //DISCOUNT PRODUCT CHECK FOR SI
        $si_discount = @$existing_sales_invoice['operation']['result']['data']['SODOCUMENT']['SODOCUMENTENTRIES']['sodocumententry'];
        if (isset($si_discount['ITEMID'])) {
            if (strpos($si_discount['ITEMID'], 'Discount') === false)
                $si_discount = null;
        } elseif (is_array($si_discount)) {
            $si_discount = collect($si_discount);
            $si_discount = $si_discount->filter(function ($item) {
                return strpos($item['ITEMID'], 'Discount') !== false;
            })->first();
        }
        // logger(json_encode($so_discount));
        if ((float) $shopifyOrderPayload['total_discounts'] > 0 && !$si_discount) {
            $line_items_si[] = [
                'item_id' => 'Discount',
                'quantity' => 1,
                'price' => $shopifyOrderPayload['total_discounts'] * -1,
                'location_id' => $shopifyOrderPayload['location_id'],
                'department_id' => $shopifyOrderPayload['department_id'],
                'class_id' => $shopifyOrderPayload['class_id'],
            ];
        }

        $salesInvoiceResponse = $this->salesJobInside($shopifyOrder, $inconnectOrder, 'Sales Invoice', $line_items_si, $inconnectOrder->second_so_id);
        return true;
    }
}
