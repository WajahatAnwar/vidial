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

class DetectMissingSalesOrderAndInvoices implements ShouldQueue
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

        if(isset($shopifyOrder['body']->order)) {
            $shopifyOrder = $shopifyOrder['body']->order;
            $shopifyOrderPayload = $shopifyOrder;

            $shopifyOrderPayload['department_id'] = $inconnect_account->intact_department->department_id;
            $shopifyOrderPayload['class_id'] = $inconnect_account->intact_class->class_id;
            $shopifyOrderPayload['location_id'] = 'Club Colors';

            $line_items_so = [];
            $existing_sales_order = $this->getExistingSalesOrderOrInvoice($inconnectOrder->intact_sales_order_id, "Sales Order");
            // logger(json_encode($existing_sales_order));

            //SHIPPING PRODUCT CHECK FOR SO
            $so_shipping = @$existing_sales_order['operation']['result']['data']['SODOCUMENT']['SODOCUMENTENTRIES']['sodocumententry'];
            if (isset($so_shipping['ITEMID'])) {
                if (strpos($so_shipping['ITEMID'], 'SHIP001') === false)
                    $so_shipping = null;
            } else {
                $so_shipping = collect($so_shipping);
                $so_shipping = $so_shipping->filter(function ($item) {
                    return strpos($item['ITEMID'], 'SHIP001') !== false;
                })->first();
            }
            // logger(json_encode($so_shipping));
            if ((float) $shopifyOrderPayload['total_shipping_price_set']['shop_money']['amount'] > 0 && !$so_shipping) {
                $line_items_so[] = [
                    'item_id' => 'SHIP001',
                    'quantity' => 1,
                    'price' => $shopifyOrderPayload['total_shipping_price_set']['shop_money']['amount'],
                    'location_id' => $shopifyOrderPayload['location_id'],
                    'department_id' => $shopifyOrderPayload['department_id'],
                    'class_id' => $shopifyOrderPayload['class_id'],
                ];
            }

            //DISCOUNT PRODUCT CHECK FOR SO
            $so_discount = @$existing_sales_order['operation']['result']['data']['SODOCUMENT']['SODOCUMENTENTRIES']['sodocumententry'];
            if (isset($so_discount['ITEMID'])) {
                if (strpos($so_discount['ITEMID'], 'Discount') === false)
                    $so_discount = null;
            } elseif (is_array($so_discount)) {
                $so_discount = collect($so_discount);
                $so_discount = $so_discount->filter(function ($item) {
                    return strpos($item['ITEMID'], 'Discount') !== false;
                })->first();
            }
            // logger(json_encode($so_discount));
            if ((float) $shopifyOrderPayload['total_discounts'] > 0 && !$so_discount) {
                $line_items_so[] = [
                    'item_id' => 'Discount',
                    'quantity' => 1,
                    'price' => $shopifyOrderPayload['total_discounts'] * -1,
                    'location_id' => $shopifyOrderPayload['location_id'],
                    'department_id' => $shopifyOrderPayload['department_id'],
                    'class_id' => $shopifyOrderPayload['class_id'],
                ];
            }

            logger("PRWORK " . $inconnectOrder->intact_sales_order_id . ": " . json_encode($line_items_so));
            if(count($line_items_so) > 0) {
                $inconnectOrder->update([
                    'sales_order_check' => true,
                    'process' => "INITIAL"
                ]);
            } else {
                $inconnectOrder->update([
                    'sales_order_check' => false,
                    'process' => "INITIAL"
                ]);
            }

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

            logger("PRWORK " . $inconnectOrder->intact_sales_invoice_id . ": " . json_encode($line_items_si));
            if(count($line_items_si) > 0) {
                $inconnectOrder->update([
                    'sales_invoice_check' => true,
                    'process' => "INITIAL"
                ]);
            } else {
                $inconnectOrder->update([
                    'sales_invoice_check' => false,
                    'process' => "INITIAL"
                ]);
            }

            return true;
        } else {
            logger("PRWORK USER NEEDS UPDATE" . json_encode($user));
        }

    }
}
