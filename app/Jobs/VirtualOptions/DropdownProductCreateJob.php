<?php

namespace App\Jobs\VirtualOptions;

use App\Models\AllInOne\User;
use App\Models\VirtualOptions\DropdownChargesProduct;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class DropdownProductCreateJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 600;
    public $tries = 2;

    private $upcharge;
    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($upcharge)
    {
        $this->upcharge = $upcharge;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $upcharge = $this->upcharge;

        // Log::info("DROPDOWN CHARGES PRODUCT CREATE");

        $all_users = User::where('role_id', 2)->where('password', '!=', '')->get();
        // Log::info(json_encode($all_users));

        foreach ($all_users as $key => $user) {

            $check = DropdownChargesProduct::where('product_price', $upcharge)->where('user_id', $user->id)->first();

            if (empty($check)) {

                if ($upcharge) {

                    $response = $user->api()->rest('POST', '/admin/api/2023-04/products.json', [
                        "product" => [
                            "title" => "Dropdown Charges $upcharge",
                            "body_html" => "Dropdown Charges Product",
                            "vendor" => "Club Colors",
                            "product_type" => "Dropdown Charges Product",
                            "tags" => "dropdown_charges, $upcharge",
                            "variant" => [
                                "price" => $upcharge,
                                "sku" => "2nd-Dropdown",
                                "barcode" => "2nd-Dropdown",
                            ],
                        ]
                    ]);

                    if ($response['errors'] == false) {
                        $new_charges_product = new DropdownChargesProduct;
                        $new_charges_product->user_id = $user->id;
                        $new_charges_product->product_id = $response['body']['product']['id'];
                        $new_charges_product->variant_id = $response['body']['product']['variants'][0]['id'];
                        $new_charges_product->product_tags = $response['body']['product']['tags'];
                        $new_charges_product->product_price = $upcharge;
                        $new_charges_product->save();
                    } else {
                        sendApiLog(false, 'API RESPONSE', $response);
                    }
                }
            }
        }
    }
}
