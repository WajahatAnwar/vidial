<?php

namespace App\Services\Punchout;


use App\Models\User;
use App\Models\Punchout\AccountFile;
use App\Models\Punchout\ShopifyAppToken;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use App\Models\Punchout\PomwCustomQuote;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class CustomQuoteProductCreationRoutine
{
    protected $quote;
    protected $shouldBeTaxable;
    protected $shop;

    public function __construct(PomwCustomQuote $quote, $appCredentialId, $shouldBeTaxable)
    {
        $this->quote = $quote;
        $this->shouldBeTaxable = $shouldBeTaxable;
        $this->shop = User::find($appCredentialId);
    }

    public function doTransfer()
    {
        $productData = $this->buildProductData();
        $response = $this->shop->api()->rest("POST", '/admin/api/2024-01/products.json', ["product" => $productData]);
        $res = $this->shop->api()->rest("PUT", "/admin/api/2024-01/inventory_items/{$response['body']['product']['variants'][0]['inventory_item_id']}.json", ["inventory_item" => ['tracked'=>false]]);
        if (!$response['errors']) {
            $productId = $response['body']['product']['id'];
            $this->quote->shopify_admin_url = "https://{$this->shop->name}/admin/products/{$productId}";
            $this->quote->save();
            if (!empty($this->quote->picture_file_id)) {
                $image = $this->getImageData();
                $shopifyImages = $this->shop->api()->rest("POST", '/admin/api/2024-04/products/' . $productId . '/images.json', ["image" => $image]);
            }
            return $productId;
        }
        Log::error('Error during product creation: ' . $response);
        return null;
    }

    private function buildProductData()
    {
        $user = Auth::user();

        $productData = [
            'title' => $this->quote->sku,
            'tags' => $this->quote->search_tag,
            'sku' => $this->quote->sku,
            'body_html' => $this->getProductBodyHtml(),
            'vendor' => 'Club Colors',
            'status' => 'active',
            'published' => true,
            'published_scope' => 'global',
            'product_type' =>  @$user->access_level->uri == "external_admin" ? 'External Quotes' : 'Custom Quotes',
            "published_at" => Carbon::now()->format('Y-m-d H:i:s'),
            'variants' => [
                [
                    'option1' => 'Default Title',
                    'price' => $this->quote->getTotal(),
                    'sku' => $this->quote->sku,
                    'taxable' => $this->shouldBeTaxable,
                    'requires_shipping' => false,
                    "compare_at_price" => null,
                    "inventory_management" => "shopify",
                    "fulfillment_service" => "manual",
                ],
            ],
        ];
        return $productData;
    }

    private function getProductBodyHtml()
    {
        $items = $this->quote->customQuoteItems;
        $html = '<table>';
        foreach ($items as $item) {
            $html .= '<tr>
        <td>' . $item->description . '</td>
        <td>' . $item->unit_price . '</td>
        <td>' . $item->quantity . '</td>
    </tr>';
        }
        $html .= '</table>';
        return $html;
    }

    private function getImageData()
    {
        $pictureFile = AccountFile::find($this->quote->picture_file_id);
        if ($pictureFile) {
            $imagePath['src'] = env('ASSET_URL').'/'.$pictureFile->public_uri;
            $imagePath['position'] = 1;
            return $imagePath;
        }
    }

}
