<?php

namespace App\Jobs\Cropica;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\DB;
use App\Models\Cropica\CropicaJob;
use Illuminate\Support\Facades\Http;
use App\Traits\GeneralTrait;
use Illuminate\Support\Facades\Log;
use App\Services\Cropica\DropboxService;


class SingleProductImagesCroping implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, GeneralTrait;


    public $user, $product, $totalImagesCount, $processedImagesCount, $serverBasePath, $cropicaJob, $retry;
    public $tries = 3;
    public $timeout = 0;
    public $jobId;

    /**
     * Create a new job instance.
     *
     * @return void
     */

    public function __construct($product, $serverBasePath, $user, $cropicaJob, $retry = false)
    {
        $this->user = $user;
        $this->product = $product;
        $this->totalImagesCount = 0;
        $this->processedImagesCount = 0;
        $this->serverBasePath = $serverBasePath;
        $this->cropicaJob = $cropicaJob;
        $this->retry = $retry;
    }

    public function deleteMedias($mediaIds, $user)
    {
        $query = <<<QUERY
        mutation productDeleteMedia(\$mediaIds: [ID!]!, \$productId: ID!) {
            productDeleteMedia(mediaIds: \$mediaIds, productId: \$productId) {
                deletedMediaIds
                deletedProductImageIds
                userErrors {
                    field
                    message
                }
            }
        }
        QUERY;

        $api = $user->api();
        $api->getOptions()->setGuzzleOptions([
            'timeout' => 120,
            'connect_timeout' => 120
        ]);
        $result = $api->graph($query, [
            'mediaIds' => $mediaIds,
            'productId' => $this->product['node']['id'],
        ]);

        if (!($result['status'] >= 200 && $result['status'] < 300)) {
            $this->cropicaJob->logs()->create([
                'user_id' => $this->user->id,
                'priority' => TRUE,
                'description' => "GraphQL Error: " . ($this->user->store_name ? $this->user->store_name : $this->user->name) . " " . json_encode($result),
            ]);

            $this->cropicaJob->update(['status' => 'Failed']);

            return ['errors' => true];
        }

        if (!@$result['body']['data']) {
            $this->cropicaJob->logs()->create([
                'user_id' => $this->user->id,
                'priority' => TRUE,
                'description' => "GraphQL Error: " . ($this->user->store_name ? $this->user->store_name : $this->user->name) . " " . json_encode($result),
            ]);

            $this->cropicaJob->update(['status' => 'Failed']);

            return ['errors' => true];
        }

        return ['errors' => false];
    }

    public function createMedias($urls, $user, $mediaIds)
    {
        $deleteResponse = $this->deleteMedias($mediaIds, $user);

        if ($deleteResponse['errors'] == true) {
            $this->cropicaJob->logs()->create([
                'user_id' => $this->user->id,
                'priority' => TRUE,
                'description' => "The existing medias are unable to delete for Product having (Shopify ID: " . $this->product['node']['legacyResourceId'] . " and Title: " . $this->product['node']['title'] . ") so further medias will not be created for store: " . ($this->user->store_name ? $this->user->store_name : $this->user->name),
            ]);

            $this->cropicaJob->update(['status' => 'Failed']);

            return ['errors' => true];
        } else {
            $query = <<<QUERY
            mutation productCreateMedia(\$media: [CreateMediaInput!]!, \$productId: ID!) {
                productCreateMedia(media: \$media, productId: \$productId) {
                    media {
                        alt
                        mediaContentType
                        status
                        ... on MediaImage {
                            id
                            image {
                                url
                            }
                        }
                    }
                    mediaUserErrors {
                        field
                        message
                    }
                    product {
                        id
                        title
                    }
                }
            }
            QUERY;

            $api = $user->api();
            $api->getOptions()->setGuzzleOptions([
                'timeout' => 120,
                'connect_timeout' => 120
            ]);
            $result = $api->graph($query, [
                'media' => $urls,
                'productId' => $this->product['node']['id'],
            ]);

            if (!($result['status'] >= 200 && $result['status'] < 300)) {
                $this->cropicaJob->logs()->create([
                    'user_id' => $this->user->id,
                    'priority' => TRUE,
                    'description' => "GraphQL Error: " . ($this->user->store_name ? $this->user->store_name : $this->user->name) . " " . json_encode($result),
                ]);

                $this->cropicaJob->update(['status' => 'Failed']);

                return ['errors' => true];
            }

            if (!@$result['body']['data']) {
                $this->cropicaJob->logs()->create([
                    'user_id' => $this->user->id,
                    'priority' => TRUE,
                    'description' => "GraphQL Error: " . ($this->user->store_name ? $this->user->store_name : $this->user->name) . " " . json_encode($result),
                ]);

                $this->cropicaJob->update(['status' => 'Failed']);

                return ['errors' => true];
            }

            return ['errors' => false];
        }
    }

    private function successfulCompletion()
    {
        $counter = 1;
        CropicaJob::where('uuid', $this->cropicaJob->uuid)->update([
            'updated_at' => now(),
            'total_images' => DB::raw('total_images + ' . (int)$this->totalImagesCount),
            'processed_images' => DB::raw('processed_images + ' . (int)$this->processedImagesCount),
            'processed_products' => DB::raw('processed_products + ' . (int)$counter),
            'status' => DB::raw("IF(processed_products + $counter > total_products, 'Complete', status)")
        ]);

        $job_completed = CropicaJob::where('uuid', $this->cropicaJob->uuid)->whereRaw("(processed_products + ?) > total_products", [$counter])->first();
        if ($job_completed) {
            $uuid = $this->cropicaJob->uuid;
            $cropicaJob = CropicaJob::where('uuid', $uuid)->first();
            $cropicaJob->jobs()->detach();
            Storage::disk('public')->deleteDirectory("$uuid");
        }

        if($this->retry) {
            $this->cropicaJob->logs()->create([
                'user_id' => $this->user->id,
                'priority' => TRUE,
                'type' => 'success',
                'description' => "Product having (Shopify ID: " . $this->product['node']['legacyResourceId'] . " and Title: " . $this->product['node']['title'] . ") all images are now synced successfully for store: " . ($this->user->store_name ? $this->user->store_name : $this->user->name) . " in retry process.",
            ]);
        } else {
            $this->cropicaJob->logs()->create([
                'user_id' => $this->user->id,
                'priority' => TRUE,
                'type' => 'success',
                'description' => "Product having (Shopify ID: " . $this->product['node']['legacyResourceId'] . " and Title: " . $this->product['node']['title'] . ") all images are now synced successfully for store: " . ($this->user->store_name ? $this->user->store_name : $this->user->name),
            ]);
        }  
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $productId = $this->product['node']['legacyResourceId'];
        $dropboxInstance = new DropboxService();
        if ($this->product['node']['media']['edges'] != null && count($this->product['node']['media']['edges']) > 0) {
            $productImages = collect($this->product['node']['media']['edges'])->map(function ($image) {
                return [
                    'id' => $image['node']['id'],
                    'src' => $image['node']['image']['url'] ?? null,
                ];
            });

            $mediaUrls = $productImages->whereNotNull('src')->pluck('src')->toArray();
            $mediaIds = $productImages->whereNotNull('src')->pluck('id')->toArray();

            $responses = Http::pool(
                fn(Pool $pool) =>
                array_map(fn($url) => $pool->get($url), $mediaUrls)
            );

            $croppedImages = [];
            $filePaths = [];
            $croppedPaths = [];
            $uuid = $this->cropicaJob->uuid;

            Storage::disk('public')->makeDirectory("$uuid/$productId/shopify_images");
            Storage::disk('public')->makeDirectory("$uuid/$productId/cropped_images");

            foreach ($responses as $response) {
                // Save each image
                $this->totalImagesCount++;
                $uri = $response->effectiveUri();
                $path = parse_url($uri, PHP_URL_PATH);
                $fileName = basename($path);
                $imageContents = $response->body();
                $filePath = "$uuid/$productId/shopify_images/$fileName";
                $croppedPath = "$uuid/$productId/cropped_images/$fileName";
                $res = Storage::disk('public')->put($filePath, $imageContents);
                if ($res === false) {
                    Log::error('Failed to save image at: ' . $filePath);
                } else {
                    $path = Storage::disk('public')->path($filePath);
                    $croppedImageURL = $this->adjustCropicaImage($path, $croppedPath, $this->serverBasePath);
                    $croppedImages[] = [
                        'alt' => 'Cropped Image',
                        'mediaContentType' => 'IMAGE',
                        'originalSource' => $croppedImageURL
                    ];

                    $this->processedImagesCount++;
                    $filePaths[] = $filePath;
                    $croppedPaths[] = $croppedPath;
                }
            }

            $createResponse = $this->createMedias($croppedImages, $this->user, $mediaIds);
            if ($createResponse['errors'] == false) {
                $dropboxInstance->uploadImagesFromDirectory("$uuid/$productId/shopify_images/", "$uuid/$productId/shopify_images/");
                $dropboxInstance->uploadImagesFromDirectory("$uuid/$productId/cropped_images/", "$uuid/$productId/cropped_images/");
                sleep(1);
                Storage::disk('public')->deleteDirectory("$uuid/$productId");
            } else {
                $this->cropicaJob->logs()->create([
                    'user_id' => $this->user->id,
                    'priority' => TRUE,
                    'description' => "As the create or delete media is failed for Product having (Shopify ID: " . $this->product['node']['legacyResourceId'] . " and Title: " . $this->product['node']['title'] . ") then product further process is not processed further for store: " . ($this->user->store_name ? $this->user->store_name : $this->user->name),
                ]);

                $this->cropicaJob->update(['status' => 'Failed']);

                $this->cropicaJob->failed_products()->create([
                    'user_id' => $this->user->id,
                    'product_id' => $this->product['node']['legacyResourceId'],
                    'product_title' => $this->product['node']['title'],
                ]);

                return false;
            }
        } else {
            $product['images']['edges'] = [];
        }

        $this->successfulCompletion();
    }
}
