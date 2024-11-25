<?php

namespace App\Jobs\InConnect;

use App\Traits\InConnect\IntacctTrait;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Traits\GeneralTrait;

class IntacctVendorInvoiceJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, IntacctTrait, GeneralTrait;

    public $timeout = 600;
    public $tries = 2;

    private $purchaseOrder;
    private $batch;


    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($purchaseOrder = null, $batch = null)
    {
        $this->purchaseOrder = $purchaseOrder;
        $this->batch = $batch;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        if ($this->purchaseOrder) {
            if ($this->purchaseOrder->inconnectOrder->is_archived)
                return;

            $this->updateOrderEntry(
                $this->purchaseOrder->inconnectOrder->shopify_order_name,
                $this->purchaseOrder->inconnectOrder->user_id,
                'VendorInvoice'
            );

            $update = $this->purchaseOrder->inconnectOrder->updates()->updateOrCreate([
                'name' => 'Intacct Vendor Invoice for ' . $this->purchaseOrder->vendor->name,
                'type' => 'intacct_vendor_invoice'
            ], [
                'initiated_at' => now(),
            ]);

            $payload = $this->purchaseOrder->intact_payload;

            $payload['intact_po_number'] = $this->purchaseOrder->intact_po_number;
            $payload['vendor_doc_no'] = $this->purchaseOrder->invoice_number;

            $invoice = $this->createPurchaseOrder($payload, 'Vendor Invoice - Shopify');
            // logger('IntacctVendorInvoiceJob' . json_encode($invoice));

            if (isset($invoice['operation']['result']['key'])) {
                $this->purchaseOrder->update([
                    'intact_invoice_number' => $invoice['operation']['result']['key'],
                ]);

                $update->update([
                    'completed_at' => now(),
                    'failed_at' => null,
                    'tries' => $update->tries + 1
                ]);
            } else {

                if (strpos(@$invoice['operation']['result']['errormessage']['error']['description2'], "is already converted") !== false) {
                    // logger("is already converted");

                    $this->purchaseOrder->update([
                        'intact_invoice_number' => "Vendor Invoice-" . explode('-', $this->purchaseOrder->intact_po_number)[1],
                    ]);

                    $update->update([
                        'completed_at' => now(),
                        'failed_at' => null,
                        'tries' => $update->tries + 1
                    ]);
                }

                !$update->completed_at && $update->update([
                    'failed_at' => now(),
                    'tries' => $update->tries + 1
                ]);
            }
        }

        if ($this->batch) {

            $payload = $this->batch->intacct_payload;
            $payload['intact_po_number'] = $this->batch->intacct_po_number;
            $payload['vendor_doc_no'] = $this->batch->invoice_number;

            $invoice = $this->createPurchaseOrder($payload, 'Vendor Invoice - Shopify');
            // logger('IntacctVendorInvoiceJob MasterPO' . json_encode($invoice));

            if (isset($invoice['operation']['result']['key'])) {
                $this->batch->update([
                    'intacct_invoice_number' => $invoice['operation']['result']['key'],
                ]);
            } else {

                if (strpos(@$invoice['operation']['result']['errormessage']['error']['description2'], "is already converted") !== false) {
                    // logger("is already converted");

                    $this->batch->update([
                        'intact_invoice_number' => "Vendor Invoice-" . explode('-', $this->batch->intacct_po_number)[1],
                    ]);
                }
            }
        }
    }
}
