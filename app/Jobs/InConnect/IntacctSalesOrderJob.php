<?php

namespace App\Jobs\InConnect;

use App\Traits\InConnect\IntacctTrait;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Traits\GeneralTrait;

class IntacctSalesOrderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, IntacctTrait, GeneralTrait;

    public $timeout = 600;
    public $tries = 2;

    private $data;
    private $inconnectOrder;
    private $type;
    private $oldLogic;
    private $onlyTest;
    private $oldTax;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($data, $inconnectOrder, $type = 'Sales Order', $oldLogic = false, $onlyTest = false, $oldTax = false)
    {
        $this->onQueue('que_orders');

        $this->data = $data;
        $this->inconnectOrder = $inconnectOrder;
        $this->type = $type;
        $this->oldLogic = $oldLogic;
        $this->oldTax = $oldTax;
        $this->onlyTest = $onlyTest;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        if ($this->inconnectOrder->is_archived)
            return;

        $inconnectOrder = $this->inconnectOrder;

        $update = $inconnectOrder->updates()->updateOrCreate([
            'name' => 'Intacct Sales Order',
            'type' => 'intacct_sales_order'
        ], [
            'initiated_at' => now(),
        ]);

        $user = $inconnectOrder->user;
        $payload = json_decode(json_encode($this->data), true);
        $this->updateOrderEntry($payload['name'], $user->id, $this->type == "Sales Order" ? 'intacctSalesOrderJobSales' : 'intacctSalesOrderJobInvoice');
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
        if ($inconnect_account->tax_exempt_number)
            $payload['tax_exempt_number'] = $inconnect_account->tax_exempt_number;
        // intact customer
        $payload['company_id'] = $inconnect_account->intact_customer->customer_id;
        $payload['company_name'] = $inconnect_account->intact_customer->name;
        foreach ($payload['line_items'] as &$line_item) {
            $line_item['item_id'] = $this->replaceSkuWithIntactItemId($line_item['sku']);
            $line_item['location_id'] = $payload['location_id'];
            $line_item['department_id'] = $payload['department_id'];
            $line_item['class_id'] = $payload['class_id'];
        }
        if ((float) $payload['total_discounts'] > 0) {
            $payload['line_items'][] = [
                'item_id' => 'Discount',
                'quantity' => 1,
                'price' => $payload['total_discounts'] * -1,
                'location_id' => $payload['location_id'],
                'department_id' => $payload['department_id'],
                'class_id' => $payload['class_id'],
            ];
        }
        if ((float) $payload['total_shipping_price_set']['shop_money']['amount'] > 0) {
            $payload['line_items'][] = [
                'item_id' => 'SHIP001',
                'quantity' => 1,
                'price' => $payload['total_shipping_price_set']['shop_money']['amount'],
                'location_id' => $payload['location_id'],
                'department_id' => $payload['department_id'],
                'class_id' => $payload['class_id'],
            ];
        }
        $key = 'intact_sales_order_id';
        if ($this->type == 'Sales Invoice') {

            $updateTwo = $inconnectOrder->updates()->updateOrCreate([
                'name' => 'Intacct Sales Invoice',
                'type' => 'intacct_sales_invoice'
            ], [
                'initiated_at' => now(),
            ]);

            if (!$inconnectOrder->intact_sales_order_id) {
                $inconnectOrder->logs()->create([
                    'user_id' => $user->id,
                    'type' => 'info',
                    'description' => 'Sales Invoice for (' . $payload['name'] . ') cannot  be created as sales order is also not created ',
                ]);
                return true;
            }

            $key = 'intact_sales_invoice_id';
            $payload['intact_so_number'] = str_replace('&', '&amp;', $inconnectOrder->intact_sales_order_id);
            $payload['document_no'] = explode('-', $inconnectOrder->intact_sales_order_id)[1];
        }

        if ($this->onlyTest) {
            $order = $this->createSalesOrder($user, $payload, $this->type, "goosely", "normal", $this->oldLogic, $this->onlyTest, $this->oldTax);
            logger()->info(json_encode($order, JSON_PRETTY_PRINT));
            return true;
        }

        if ($this->type == 'Sales Order' && $inconnectOrder->intact_sales_order_id) {
            $inconnectOrder->logs()->create([
                'user_id' => $user->id,
                'type' => 'info',
                'description' => 'Sales Order (' . $inconnectOrder->intact_sales_order_id . ') is already placed for Order ' . $payload['name'],
            ]);
            $update->update([
                'completed_at' => now(),
                'failed_at' => null,
                'tries' => $update->tries + 1
            ]);
            return true;
        } else if ($this->type == 'Sales Invoice' && $inconnectOrder->intact_sales_invoice_id) {
            $inconnectOrder->logs()->create([
                'user_id' => $user->id,
                'type' => 'info',
                'description' => 'Sales Invoice (' . $inconnectOrder->intact_sales_invoice_id . ') is already converted for Order ' . $payload['name'],
            ]);
            $updateTwo->update([
                'completed_at' => now(),
                'failed_at' => null,
                'tries' => $update->tries + 1
            ]);
            return true;
        }

        // logger(json_encode($payload,JSON_PRETTY_PRINT));
        // return true;

        $order = $this->createSalesOrder($user, $payload, $this->type, "goosely", "normal", $this->oldLogic, $this->onlyTest, $this->oldTax);
        // logger()->info($payload['name'] . " " . json_encode($order, JSON_PRETTY_PRINT));

        if (isset($order['operation']['result']['key'])) {
            $inconnectOrder->{$key} = $order['operation']['result']['key'];
            $inconnectOrder->save();

            $update->update([
                'completed_at' => now(),
                'failed_at' => null,
                'tries' => $update->tries + 1
            ]);

            if (isset($updateTwo)) {
                $updateTwo->update([
                    'completed_at' => now(),
                    'failed_at' => null,
                    'tries' => $update->tries + 1
                ]);
            }
        } else {

            if (strpos(@$order['operation']['result']['errormessage']['error']['description2'], "is already converted") !== false) {

                $inconnectOrder->update([
                    'intact_sales_invoice_id' => "Sales Invoice-" . explode('-', $inconnectOrder->intact_sales_order_id)[1],
                ]);

                $update->update([
                    'completed_at' => now(),
                    'failed_at' => null,
                    'tries' => $update->tries + 1
                ]);

                if (isset($updateTwo)) {
                    $updateTwo->update([
                        'completed_at' => now(),
                        'failed_at' => null,
                        'tries' => $update->tries + 1
                    ]);
                }
            }

            !$update->completed_at && $update->update([
                'failed_at' => now(),
                'tries' => $update->tries + 1
            ]);

            if (isset($updateTwo)) {
                !$updateTwo->completed_at && $updateTwo->update([
                    'failed_at' => now(),
                    'tries' => $update->tries + 1
                ]);
            }
        }
    }
}
