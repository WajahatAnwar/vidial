<?php

namespace App\Traits;

use App\Jobs\InConnect\IdexOrderJob;
use App\Jobs\InConnect\ScreenProJob;
use App\Models\InConnect\OrderEntry;
use App\Models\InConnect\GooselyRule;
use App\Models\AllInOne\ProductVariant;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
trait GeneralTrait
{
    public function decideDecorator($user, $shopifyOrder, $inconnectOrder, $originalGraphQLOrder, $gooselyRule, $customIdex = false, $onlyTest = false, $idexFast = false, $idexToken = false)
    {
        $decorator = $user->inconnect_account->decorators()->first();
        $inconnectOrder->update([
            'decorator_id' => $decorator->id,
        ]);

        if (stripos($decorator->name, 'idex') !== false) {
            IdexOrderJob::dispatch($user, $shopifyOrder, $inconnectOrder, $originalGraphQLOrder, $gooselyRule, $customIdex, $onlyTest, $idexFast, $idexToken);
        } else if (stripos($decorator->name, 'screen pro graphics') !== false) {
            ScreenProJob::dispatch($user, $shopifyOrder, $inconnectOrder, $originalGraphQLOrder, $gooselyRule, $customIdex, $onlyTest);
        }
    }

    public function updateOrderEntry($order_name, $user_id, $step, $inconnect_order_id = NULL)
    {
        $existing_order_entry = OrderEntry::where('user_id', $user_id)->where('order_name', $order_name)->first();

        $updateData = [
            $step => $existing_order_entry ? $existing_order_entry[$step] + 1 : 1,
        ];

        if ($inconnect_order_id) {
            $updateData['inconnect_order_id'] = $inconnect_order_id;
        }

        OrderEntry::updateOrCreate([
            'user_id' => $user_id,
            'order_name' => $order_name,
        ], $updateData);
    }

    public function createImageFromFile($filePath)
    {
        // Check if the file exists
        if (!file_exists($filePath)) {
            throw new Exception("File not found: $filePath");
        }

        // Get the file's mime type
        $mimeType = mime_content_type($filePath);

        // Create the image based on mime type
        switch ($mimeType) {
            case 'image/jpeg':
                return imagecreatefromjpeg($filePath);
            case 'image/png':
                return imagecreatefrompng($filePath);
            case 'image/gif':
                return imagecreatefromgif($filePath);
            case 'image/webp':
                return imagecreatefromwebp($filePath);
            default:
                throw new Exception("Unsupported image type: $mimeType");
        }
    }

    public function getDominantColor($imagePath)
    {
        $image = $this->createImageFromFile($imagePath);
        $width = imagesx($image);
        $height = imagesy($image);

        $colors = [];
        for ($x = 0; $x < $width; $x++) {
            for ($y = 0; $y < $height; $y++) {
                $rgb = imagecolorat($image, $x, $y);
                $colors[$rgb] = isset($colors[$rgb]) ? $colors[$rgb] + 1 : 1;
            }
        }
        arsort($colors);
        $dominantColor = key($colors);

        $r = ($dominantColor >> 16) & 0xFF;
        $g = ($dominantColor >> 8) & 0xFF;
        $b = $dominantColor & 0xFF;

        imagedestroy($image);
        return 'rgb(' . $r . ', ' . $g . ', ' . $b . ')';
    }

    public function adjustCropicaImage($image_path,$cropped_path,$serverBasePath)
    {
        $image = new \Imagick($image_path);
        $image->setResourceLimit(\Imagick::RESOURCETYPE_MEMORY, 256);
        $image->setResourceLimit(\Imagick::RESOURCETYPE_MAP, 256);
        $background_color = $this->getDominantColor($image_path);
        if ($background_color != 'rgb(255, 255, 255)') {
            $image->transparentPaintImage(new \ImagickPixel('white'), 0, 10000, false);
        }
        // Trim the image to remove any transparent padding
        $image->trimImage(0);
        $width = $image->getImageWidth();
        $height = $image->getImageHeight();
        $size = max($width, $height);
        $squareImage = new \Imagick();
        $squareImage->newImage($size, $size, new \ImagickPixel('white'));
        $squareImage->compositeImage($image, \Imagick::COMPOSITE_OVER, ($size - $width) / 2, ($size - $height) / 2);
        $squareImage->writeImage($serverBasePath . 'storage/'.$cropped_path);
        // Free up resources
        $squareImage->clear();
        $squareImage->destroy();
        $image->clear();
        $image->destroy();
        return Storage::disk('public')->url($cropped_path);
    }

    public function graphQLOrderResponse($shopifyOrderId, $user) {
      $lineItems = [];
      $hasNextPage = true;
      $cursor = null;
      
      while ($hasNextPage) {

        $cursor = $cursor ? '"' . $cursor . '"' : 'null';

        $query = <<<GRAPHQL
        {
          order(id: "gid://shopify/Order/{$shopifyOrderId}") {
            id
            ... on Order {
              legacyResourceId
              name
              createdAt
              currencyCode
              subtotalPriceSet {
                presentmentMoney {
                  amount
                  currencyCode
                }
              }
              totalPriceSet {
                presentmentMoney {
                  amount
                  currencyCode
                }
              }
              totalTaxSet {
                presentmentMoney {
                  amount
                  currencyCode
                }
              }
              totalShippingPriceSet {
                presentmentMoney {
                  amount
                  currencyCode
                }
              }
              lineItems(first: 250, after: $cursor) {
                edges {
                  node {
                    id
                    title
                    quantity
                    product {
                      title
                      legacyResourceId
                      handle
                      vendor
                      productType
                    }
                    variant {
                      id
                      legacyResourceId
                      title
                      sku
                      barcode
                      price
                      selectedOptions {
                          name
                          value
                      }
                    }
                    customAttributes {
                      key
                      value
                    }
                  }
                }
                pageInfo {
                  startCursor
                  endCursor
                  hasNextPage
                  hasPreviousPage
                }
              }
              risk {
                assessments {
                    facts {
                        description
                        sentiment
                    }
                    riskLevel
                }
                recommendation
              } 
            }
          }
        }
        GRAPHQL;

        $response = $user->api()->graph($query);
        $cursor = $response['body']['data']['order']['lineItems']['pageInfo']['endCursor'];
        $lineItems = array_merge($lineItems, $response['body']['data']['order']['lineItems']['edges']->toArray());
        $hasNextPage = $response['body']['data']['order']['lineItems']['pageInfo']['hasNextPage'];
      }

      $convertedResponse = $response['body']->toArray();
      $convertedResponse['data']['order']['lineItems']['edges'] = $lineItems;
      $response['body'] = $convertedResponse;
      return $response;
    }

    public function gooselyRuleProcess($order) {
      // GENERAL VARIABLE // RULE CODE LOGS FOR THIS CODE
      $gooselyRule['success'] = false;
      $gooselyRule['message'] = "Rule not found for any product";

      $rules = GooselyRule::with('product_type')->get();
      $rules = collect($rules);

      $line_items_searchable = $order['body']['data']['order']['lineItems'];
      $line_items_searchable = removeNodesAndEdges($line_items_searchable);
      $line_items_searchable = collect($line_items_searchable);
      // logger(json_encode($line_items_searchable));

      foreach ($rules as $key => $rule) {
          $found = $line_items_searchable->filter(function ($item) use ($rule) {
              return @$item['product']['productType'] == $rule->product_type->name;
          })->first();

          if ($found) {
              $gooselyRule['success'] = true;
              $gooselyRule['message'] = "Goosely Rules, " . $found['product']['productType'] . " not allowed";
              $gooselyRule['rule'] = $rule;
              break;
          }
      }
      // logger(json_encode($gooselyRule));

      return $gooselyRule;
    }

    public function replaceSkuWithIntactItemId($sku)
    {
      $exist = ProductVariant::where('sku', $sku)->whereNotNull('intacct_item_id')->first();
      if($exist){
        return $exist->intacct_item_id;
      }
      return '';
    }
}
