<?php

namespace App\Jobs\InConnect;

use App\Traits\InConnect\IdexTrait;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use App\Traits\GeneralTrait;

class IdexOrderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, IdexTrait, GeneralTrait;

    public $timeout = 600;
    public $tries = 2;

    private $user;
    private $data;
    private $inconnectOrder;
    private $order;
    private $gooselyRule;
    private $customIdex;
    private $onlyTest;
    private $idexFast;
    private $idexToken;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($user, $data, $inconnectOrder, $order, $gooselyRule, $customIdex = false, $onlyTest = false, $idexFast = false, $idexToken = false)
    {
        $this->onQueue('que_orders');

        $this->user = $user;
        $this->data = $data;
        $this->inconnectOrder = $inconnectOrder;
        $this->order = $order;
        $this->gooselyRule = $gooselyRule;
        $this->customIdex = $customIdex;
        $this->onlyTest = $onlyTest;
        $this->idexFast = $idexFast;
        $this->idexToken = $idexToken;
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

        $access_token = !$this->idexToken ? $this->getAccessToken() : $this->idexToken;
        $user = $this->user;
        $shopifyOrder = $this->data;
        $order = $this->order;
        $gooselyRule = $this->gooselyRule;
        $customIdex = $this->customIdex;
        $onlyTest = $this->onlyTest;
        $idexFast = $this->idexFast;
        $inconnectOrder = $this->inconnectOrder;

        $this->updateOrderEntry($shopifyOrder->name, $user->id, 'idexOrderJob');

        $idexLineItemResponse = $this->idexLineItemsProcess($user, $shopifyOrder, $inconnectOrder, $order, $gooselyRule, $customIdex, $onlyTest, $idexFast, $this->idexToken);

        if (!$idexLineItemResponse['success'])
            return true;

        $payload = $idexLineItemResponse['payload'];
        $idexProcess = $idexLineItemResponse['idex_process'];
        $update = $idexLineItemResponse['update'];
        $decorator = $idexLineItemResponse['decorator'];
        $sage_items = $idexLineItemResponse['sage_items'];

        if (!$inconnectOrder->decorator_sent && !$onlyTest) {
            if ($user->inconnect_account->decorator_sync && !(isset($gooselyRule['rule']['shopifyOrder']) && $gooselyRule['rule']['shopifyOrder'])) {

                // logger()->info(json_encode($payload, JSON_PRETTY_PRINT));

                if ($idexProcess) {
                    $response = Http::withToken($access_token)->post('https://portal.idexint.com/api/v1/orders/create', [
                        'orders' => [$payload]
                    ]);
                    $data = $response->json();
                    // logger()->info(json_encode($data, JSON_PRETTY_PRINT));

                    if (!$data[0]['success']) {
                        $inconnectOrder->logs()->create([
                            'user_id' => $user->id,
                            'priority' => TRUE,
                            'description' => 'Error in Syncing Order ' . $shopifyOrder->name . " for decorator. Error: " . $data[0]['error']
                        ]);

                        !$update->completed_at && $update->update([
                            'failed_at' => now(),
                            'tries' => $update->tries + 1,
                            'retry' => 1
                        ]);

                        return;
                    }

                    $inconnectOrder->update([
                        'decorator_sent' => true,
                        'decorator_order_id' => $data[0]['purchaseOrder'],
                        'decorator_second_order_id' => $data[0]['orderID']
                    ]);
                }

                $update->update([
                    'completed_at' => now(),
                    'failed_at' => null,
                    'tries' => $update->tries + 1
                ]);
            } else {
                if (!$user->inconnect_account->decorator_sync) {
                    $inconnectOrder->logs()->create([
                        'user_id' => $user->id,
                        'priority' => TRUE,
                        'description' => 'Decorator Sync is off for Order ' . $shopifyOrder->name,
                    ]);
                } else {
                    // logger("RULE CODE: IDEX CANCELLED");
                }
            }
        }

        if ($onlyTest) {
            logger()->info(json_encode($payload, JSON_PRETTY_PRINT));
        }

        $payload = [
            'due_date' => $payload['dateDue'],
            'vendor_id' => $decorator->intactVendor->vendor_id,
            'reference_no' => removeHash($shopifyOrder->name),
            'document_no' => $payload['purchaseOrder'],
            'line_items' => $sage_items
        ];

        if ($onlyTest) {
            logger()->info("MAIN FLOW: 3" . json_encode($payload, JSON_PRETTY_PRINT));
        }

        if ($user->inconnect_account->intact_sync) {
            if (!$inconnectOrder->decorator_intact_sent || $onlyTest) {
                $check_one = "";
                $check_two = "";
                if ($shopifyOrder->financial_status)
                    $check_one = $user->inconnect_account->statuses->where("financial_status_" . $shopifyOrder->financial_status, true)->first();
                if ($shopifyOrder->fulfillment_status)
                    $check_two = $user->inconnect_account->statuses->where("fulfillment_status_" . $shopifyOrder->fulfillment_status, true)->first();

                if ($check_one || $check_two) {

                    $log_created = $inconnectOrder->logs()->create([
                        'user_id' => $user->id,
                        'priority' => false,
                        'description' => 'The Order will be placed after 30 minutes from Order time for Order ' . $shopifyOrder->name
                    ]);

                    // IntacctOrderCreateJob::dispatch($payload, 'decorator', $inconnectOrder, null, $inconnectOrder->decorator_second_order_id, $log_created->id)->delay(now()->addMinutes(30));

                    if (!(isset($gooselyRule['rule']['intacctOrder']) && $gooselyRule['rule']['intacctOrder'])) {
                        if ($idexProcess && $inconnectOrder->decorator_second_order_id) {
                            if ($idexFast || $onlyTest)
                                IntacctOrderCreateJob::dispatch($payload, $decorator->name . '|decorator', $inconnectOrder, null, $inconnectOrder->decorator_second_order_id, $log_created->id, $onlyTest);
                            else if (!$onlyTest)
                                IntacctOrderCreateJob::dispatch($payload, $decorator->name . '|decorator', $inconnectOrder, null, $inconnectOrder->decorator_second_order_id, $log_created->id, $onlyTest)->delay(now()->addMinutes(10));
                        }
                    }
                }
            }
        } else {
            $inconnectOrder->logs()->create([
                'user_id' => $user->id,
                'priority' => TRUE,
                'description' => 'Intacct Sync (for Decorator) Disabled for Order ' . $shopifyOrder->name
            ]);
            // return;
        }
    }
}
