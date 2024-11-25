<?php

namespace App\Jobs\InConnect;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Traits\InConnect\VendorTrait;


class VendorInvoiceJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, VendorTrait;

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

            if (!$this->purchaseOrder->invoice_number) {
                $invoice = $this->getInvoices($this->purchaseOrder->purchase_order_no, $this->purchaseOrder->vendor);
                // logger('VendorInvoiceJob' . $this->purchaseOrder->vendor->name . json_encode($invoice));
                if (isset($invoice->InvoiceArray->Invoice->invoiceNumber)) {
                    $this->purchaseOrder->update([
                        'invoice_number' => $invoice->InvoiceArray->Invoice->invoiceNumber
                    ]);
                    IntacctVendorInvoiceJob::dispatch($this->purchaseOrder);
                }
            } else {
                IntacctVendorInvoiceJob::dispatch($this->purchaseOrder);
            }
        }

        if ($this->batch) {

            if (!$this->batch->invoice_number) {
                $invoice = $this->getInvoices($this->batch->purchase_order_no, $this->batch->batchSetting->vendor->name);
                // logger('VendorInvoiceJob MasterPO' . $this->batch->batchSetting->vendor->name . json_encode($invoice));
                if (isset($invoice->InvoiceArray->Invoice->invoiceNumber)) {
                    $this->batch->update([
                        'invoice_number' => $invoice->InvoiceArray->Invoice->invoiceNumber
                    ]);
                    IntacctVendorInvoiceJob::dispatch(null, $this->batch);
                }
            } else {
                IntacctVendorInvoiceJob::dispatch(null, $this->batch);
            }
        }
    }
}
