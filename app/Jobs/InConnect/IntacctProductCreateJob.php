<?php

namespace App\Jobs\InConnect;

use App\Traits\InConnect\IntacctTrait;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\AllInOne\ProductVariant;

class IntacctProductCreateJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, IntacctTrait;

    public $timeout = 600;
    public $tries = 2;

    private $data;
    private $variantId;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($data, $variantId = null)
    {
        $this->onQueue('que_cp');

        $this->data = $data;
        $this->variantId = $variantId;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $payload = $this->data;
        // Log::info(json_encode($payload));
        $product = $this->createItem($payload, "goosely");
        // logger()->info(json_encode($product, JSON_PRETTY_PRINT));
        // if(@$product['operation']['result']['data']['item']['ITEMID'] == 'LST640-L-Black') {
        //     logger()->info(json_encode($product, JSON_PRETTY_PRINT));
        //     logger()->info(json_encode(@$product['operation']['result']['data']['item']['ITEMID'], JSON_PRETTY_PRINT));
        //     logger()->info(json_encode($this->variant, JSON_PRETTY_PRINT));
        // }

        $existing_variant = ProductVariant::where('variant_id', $this->variantId)->first();
        if ($existing_variant) {
            $existing_variant->intacct_item_id = @$product;
            $existing_variant->save();
        }
    }
}
