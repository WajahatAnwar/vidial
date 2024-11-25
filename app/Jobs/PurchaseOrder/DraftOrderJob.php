<?php

namespace App\Jobs\PurchaseOrder;

use App\Mail\PurchaseOrder\DraftOrderMail;
use App\Models\AllInOne\User;
use App\Models\PurchaseOrder\POEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class DraftOrderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $po_order = "";

    public $timeout = 600;
    public $tries = 2;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($po_order_old)
    {
        $this->po_order = $po_order_old;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $po_order = $this->po_order;

        $emails = POEmail::where('email_status', true)
            ->where('email_sender_type', 'order_draft')
            ->get();

        $store = User::find($po_order->user_id);

        foreach ($emails as $key => $value) {
            // Log::info(json_encode($value));

            foreach (json_decode($value->senders_list) as $key => $value2) {
                // Log::info($value2);

                Mail::to("$value2")->send(new DraftOrderMail($value, $po_order));
            }

            foreach (explode(",", $store->store_emails) as $key => $value3) {
                Mail::to($value3)->send(new DraftOrderMail($value, $po_order));
            }
        }
    }
}
