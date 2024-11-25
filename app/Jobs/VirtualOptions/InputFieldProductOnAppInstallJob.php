<?php

namespace App\Jobs\VirtualOptions;

use App\Models\VirtualOptions\InputFieldsProduct;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class InputFieldProductOnAppInstallJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 600;
    public $tries = 2;

    private $charges_list;
    private $user;
    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($charges_list, $user)
    {
        $this->charges_list = $charges_list;
        $this->user = $user;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        // Log::info("APP INSTALL PRODUCT CREATE INPUT FIELD");

        $charges_list = $this->charges_list;
        $user = $this->user;

        foreach ($charges_list as $key => $value) {

            $check = InputFieldsProduct::where('product_price', $value->product_price)->where('user_id', $user->id)->first();
            if (empty($check)) {

                $response = $user->api()->rest('POST', '/admin/api/2023-04/products.json', [
                    "product" => [
                        "title" => "Input Field Charges $value->product_price",
                        "body_html" => "Input Field Charges Product",
                        "vendor" => "Club Colors",
                        "product_type" => "Input Field Charges Product",
                        "tags" => "input_field_charges, $value->product_price",
                        "variant" => [
                            "price" => $value->product_price,
                            "sku" => "2nd-Input",
                            "barcode" => "2nd-Input",
                        ],
                    ]
                ]);

                if ($response['errors'] == false) {
                    $new_charges_product = new InputFieldsProduct;
                    $new_charges_product->user_id = $user->id;
                    $new_charges_product->product_id = $response['body']['product']['id'];
                    $new_charges_product->variant_id = $response['body']['product']['variants'][0]['id'];
                    $new_charges_product->product_tags = $response['body']['product']['tags'];
                    $new_charges_product->product_price = $value->product_price;
                    $new_charges_product->save();
                } else {
                    sendApiLog(false, 'API RESPONSE', $response);
                }
            }
        }
    }
}
