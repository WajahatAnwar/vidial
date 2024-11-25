<?php

namespace App\Jobs\Cropica;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Traits\GeneralTrait;
use App\Jobs\Cropica\SingleProductImagesCroping;
use App\Models\Cropica\CropicaJob;
use Exception;
use Illuminate\Foundation\Bus\DispatchesJobs;
use GuzzleHttp\Exception\ConnectException;

class ProcessProductImageResize implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, GeneralTrait, DispatchesJobs {
        DispatchesJobs::dispatch insteadof Dispatchable; // Use dispatch from DispatchesJobs
        DispatchesJobs::dispatchNow insteadof Dispatchable;
        DispatchesJobs::dispatchSync insteadof Dispatchable;
    }

    public $user, $type, $resources, $serverBasePath, $cropicaJob, $retry;
    public $timeout = 0;
    public $processedImagesCount = 0;
    public $totalImagesCount = 0;
    public $tries = 5;
    public $uniqueFor = 30;

    /**
     * Create a new job instance.
     *
     * @return void
     */

    public function __construct($user, $type, $resources, $serverBasePath, $cropicaJob, $retry = false)
    {
        $this->user = $user;
        $this->type = $type;
        $this->resources = $resources;
        $this->serverBasePath = $serverBasePath;
        $this->cropicaJob = $cropicaJob;
        $this->retry = $retry;
    }

    private function initialLoggings()
    {
        if($this->retry) {
            CropicaJob::where('id', $this->cropicaJob->id)->update([
                'status' => 'InProgress',
                'updated_at' => now()
            ]);
        } else {
            CropicaJob::where('id', $this->cropicaJob->id)->update([
                'processed_products' => 0,
                'status' => 'InProgress',
                'updated_at' => now()
            ]);
        }
      
        $this->cropicaJob->logs()->create([
            'user_id' => $this->user->id,
            'type' => 'info',
            'description' => 'Products image resizing job started successfully for store: ' . ($this->user->store_name ? $this->user->store_name : $this->user->name),
        ]);
    }

    /**
     * Execute the job.
     *
     * @return void
     */

    public function handle()
    {
        $this->initialLoggings();

        if ($this->type == 'allproducts') {

            $hasNextPage = true;
            $endCursor = null;

            while ($hasNextPage) {

                try {

                    $endCursorString = (isset($endCursor) && !is_null($endCursor)) ? ', after: "' . $endCursor . '"' : '';
                    $productsQuery = <<<QUERY
                    {
                        products(first: 250 $endCursorString) {
                            edges {
                                node {
                                    id
                                    title
                                    legacyResourceId
                                    media(first: 100) {
                                        edges {
                                            node {
                                                ... on MediaImage {
                                                    id
                                                    image {
                                                        url
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                cursor
                            }
                            pageInfo {
                                hasNextPage
                                endCursor
                            }
                        }
                    }
                    QUERY;

                    $result = $this->user->api()->graph($productsQuery);
                    if (!($result['status'] >= 200 && $result['status'] < 300)) {
                        $this->cropicaJob->logs()->create([
                            'user_id' => $this->user->id,
                            'priority' => TRUE,
                            'description' => "GraphQL Error: " . ($this->user->store_name ? $this->user->store_name : $this->user->name) . " " . json_encode($result),
                        ]);

                        $this->cropicaJob->update(['status' => 'Failed']);

                        return false;
                    }

                    if (!@$result['body']['data']) {
                        $this->cropicaJob->logs()->create([
                            'user_id' => $this->user->id,
                            'priority' => TRUE,
                            'description' => "GraphQL Error: " . ($this->user->store_name ? $this->user->store_name : $this->user->name) . " " . json_encode($result),
                        ]);

                        $this->cropicaJob->update(['status' => 'Failed']);

                        return false;
                    }

                    if (count($result['body']['container']['data']['products']['edges']) == 0) {
                        $hasNextPage = false;

                        return false;
                    }

                    $products = $result['body']['container']['data']['products']['edges'];
                    $endCursor = $result['body']['container']['data']['products']['pageInfo']['endCursor'];
                    $hasNextPage = (isset($endCursor) && !is_null($endCursor)) ? true : false;
                    $jobs = [];

                    foreach ($products as $key => $product) {
                        $this->cropicaJob->logs()->create([
                            'user_id' => $this->user->id,
                            'type' => 'info',
                            'description' => "Job for product having Shopify ID: " . $product['node']['legacyResourceId'] . " and Title: " . $product['node']['title'] . "related to store: " . ($this->user->store_name ? $this->user->store_name : $this->user->name) . " is intiated successfully.",
                        ]);
                        $job = new SingleProductImagesCroping($product, $this->serverBasePath, $this->user, $this->cropicaJob);
                        $jobId = $this->dispatch($job);
                        $jobs[] = $jobId;
                    }

                    $cropicaJob = CropicaJob::find($this->cropicaJob->id);
                    if ($cropicaJob) {
                        $cropicaJob->jobs()->sync($jobs);
                    }
                } catch (ConnectException $e) {
                    $this->cropicaJob->logs()->create([
                        'user_id' => $this->user->id,
                        'priority' => TRUE,
                        'description' => "Connection Exception: " . ($this->user->store_name ? $this->user->store_name : $this->user->name) . " " . $e->getMessage(),
                    ]);

                    $this->cropicaJob->update(['status' => 'Failed']);

                    break;
                } catch (Exception $e) {
                    $this->cropicaJob->logs()->create([
                        'user_id' => $this->user->id,
                        'priority' => TRUE,
                        'description' => "Exception: " . ($this->user->store_name ? $this->user->store_name : $this->user->name) . " " . $e->getMessage(),
                    ]);

                    $this->cropicaJob->update(['status' => 'Failed']);

                    break;
                }
            }
        } else if (count($this->resources) > 0) {

            try {

                $request_data = $this->resources;
                $global_ids = array_map(function ($id) {
                    return base64_encode("gid://shopify/Product/{$id}");
                }, $request_data);
                $formatted_ids = '"' . implode('", "', $global_ids) . '"';

                $productsQuery = <<<QUERY
                {
                    nodes(ids: [$formatted_ids]) {
                        ... on Product {
                            id
                            title
                            legacyResourceId
                            media(first: 100) {
                                edges {
                                    node {
                                        ... on MediaImage {
                                            id
                                            image {
                                                url
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                QUERY;

                $result = $this->user->api()->graph($productsQuery);
                if (!($result['status'] >= 200 && $result['status'] < 300)) {
                    $this->cropicaJob->logs()->create([
                        'user_id' => $this->user->id,
                        'priority' => TRUE,
                        'description' => "GraphQL Error: " . ($this->user->store_name ? $this->user->store_name : $this->user->name) . " " . json_encode($result),
                    ]);

                    $this->cropicaJob->update(['status' => 'Failed']);

                    return false;
                }

                if (!@$result['body']['data']) {
                    $this->cropicaJob->logs()->create([
                        'user_id' => $this->user->id,
                        'priority' => TRUE,
                        'description' => "GraphQL Error: " . ($this->user->store_name ? $this->user->store_name : $this->user->name) . " " . json_encode($result),
                    ]);

                    $this->cropicaJob->update(['status' => 'Failed']);

                    return false;
                }

                $products = $result['body']['data']['nodes'];
                $jobs = [];

                foreach ($products as $key => $product) {
                    $product['node'] = $product;
                    $this->cropicaJob->logs()->create([
                        'user_id' => $this->user->id,
                        'type' => 'info',
                        'description' => "Job for product having Shopify ID: " . $product['node']['legacyResourceId'] . " and Title: " . $product['node']['title'] . "related to store: " . ($this->user->store_name ? $this->user->store_name : $this->user->name) . " is intiated successfully.",
                    ]);
                    $job = new SingleProductImagesCroping($product, $this->serverBasePath, $this->user, $this->cropicaJob, $this->retry);
                    $jobId = $this->dispatch($job);
                    $jobs[] = $jobId;
                }

                $cropicaJob = CropicaJob::find($this->cropicaJob->id);
                if ($cropicaJob) {
                    $cropicaJob->jobs()->sync($jobs);
                }
            } catch (ConnectException $e) {
                $this->cropicaJob->logs()->create([
                    'user_id' => $this->user->id,
                    'priority' => TRUE,
                    'description' => "Connection Exception: " . ($this->user->store_name ? $this->user->store_name : $this->user->name) . " " . $e->getMessage(),
                ]);

                $this->cropicaJob->update(['status' => 'Failed']);
            } catch (Exception $e) {
                $this->cropicaJob->logs()->create([
                    'user_id' => $this->user->id,
                    'priority' => TRUE,
                    'description' => "Exception: " . ($this->user->store_name ? $this->user->store_name : $this->user->name) . " " . $e->getMessage(),
                ]);

                $this->cropicaJob->update(['status' => 'Failed']);
            }
        }
    }
}
