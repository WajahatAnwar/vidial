<?php

namespace App\Jobs\VirtualOptions;

use App\Models\VirtualOptions\InputFieldsProduct;
use App\Models\AllInOne\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class InputFieldProductDeleteJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 600;
    public $tries = 2;

    private $amount;
    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($amount)
    {
        $this->amount = $amount;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $amount = $this->amount;

        // Log::info("CHARGES PRODUCT DELETE JOB INPUT FIELD");

        $inside_products = InputFieldsProduct::where('product_price', $amount)->get();
        foreach ($inside_products as $key2 => $product) {
            $inside_user = User::find($product->user_id);
            $response = $inside_user->api()->rest('delete', '/admin/api/2023-04/products/' . $product->product_id . '.json', [
                "products/" . $product->product_id . ""
            ]);

            if ($response['errors'] == false) {
            } else {
                sendApiLog(false, 'API RESPONSE', $response);
            }

            $product->delete();
        }
    }
}
