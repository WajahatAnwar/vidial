<?php

namespace App\Http\Controllers\Cropica;

use App\Http\Controllers\Controller;
use App\Jobs\Cropica\ProcessProductImageResize;
use App\Jobs\Cropica\CropicaJobFailedProduct;
use App\Models\InConnect\ShopifyVendor;
use \Illuminate\Support\Str;
use Inertia\Inertia;
use App\Traits\GeneralTrait;
use Illuminate\Http\Request;
use App\Models\AllInOne\User;
use App\Models\Cropica\CropicaJob;
use App\Models\AllInOne\Collection;
use Illuminate\Support\Facades\Log;

class CropicaController extends Controller
{
    use GeneralTrait;

    private function fetch_products_from_shopify($storeObject, $graphQuery)
    {
        $productsQuery = <<<GRAPHQL
        {
            products($graphQuery) {
                edges {
                    node {
                        id
                        title
                        legacyResourceId
                        vendor
                        handle
                        createdAt
                        productCategory{
                            productTaxonomyNode{
                                fullName
                            }
                        }
                        featuredImage {
                            url
                        }
                        mediaCount {
                            count
                        }
                        featuredMedia{
                            alt
                            preview{
                                image{
                                    altText
                                    height
                                    width
                                }
                            }

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
        }
        GRAPHQL;
        return $storeObject->api()->graph($productsQuery);
    }

    public function fetchStores(Request $request)
    {
        session(['job_delay' => 0]);
        $stores = User::where('role_id', 2)
            ->whereNotNull('password')
            ->select(['id', 'name', 'store_name'])
            ->get()
            ->map(function ($store) {
                return [
                    'id' => $store->id,
                    'name' => $store->store_name != null ? $store->store_name : $store->name,
                ];
            });
        return Inertia::render('Applications/Cropica/FetchProducts/FetchProducts', ['stores' => $stores]);
    }

    public function fetchProductsFromSingleStore(Request $request)
    {
        if ($request->has('store')) {
            $storeID = $request->store;
        } else {
            return response()->json(['message' => 'Explicit Store Selection Needed.']);
        }

        $store = User::firstWhere('id', $storeID);

        if ($request->ajax()) {

            $request->has('cursor') ? $cursor = $request->cursor : $cursor = null;
            $request->has('going') ? $going = $request->going : $going = null;

            $baseQuery = 'first:' . $request->page_count;
            $queryString = [];
            $query = null;

            if ($request->q) {
                $queryString[] = '(title:*' . $request->q . '* OR handle:*' . $request->q . '*)';
            }

            if ($request->q2) {
                $vendorsArrayToString = implode(',', json_decode($request->q2, true));
                $queryString[] = '(vendor:*' . $vendorsArrayToString . '*)';
            }

            // if ($request->q3) {
            //     $collectionsArrayToString = implode(',', json_decode($request->q3, true));
            //     $queryString[] = '(category:*' . $collectionsArrayToString . '*)';
            // }

            if ($request->q4) {
                $queryString[] = '(tags:*' . $request->q4 . '*)';
            }

            if (!empty($queryString)) {
                $query = ', query: "' . implode(' AND ', $queryString) . '"';
            }

            if ($going == 'next') {
                $graphQuery = $baseQuery . ', after:"' . $cursor . '"';
                if ($query) {
                    $graphQuery .= $query;
                }
            } elseif ($going == 'prev') {
                $graphQuery = 'last:' . $request->page_count . ', before:"' . $cursor . '"';
                if ($query) {
                    $graphQuery .= $query;
                }
            } else {
                $graphQuery = $baseQuery;
                if ($query) {
                    $graphQuery .= $query;
                }
            }

            $sortKey = 'CREATED_AT';
            $reverse = $request->sort == 'id asc' ? 'true' : 'false';
            $graphQuery .= ', sortKey: ' . $sortKey . ', reverse: ' . $reverse;

            // logger('graphquery');
            // logger(json_encode($graphQuery));

            $result = $this->fetch_products_from_shopify($store, $graphQuery);


            if ($result['errors'] ?? false) {
                // logger(json_encode($result));
                return response()->json(['message' => 'Error fetching products.']);
            } else {

                $startCursor = $result['body']['container']['data']['products']['pageInfo']['startCursor'];
                $endCursor = $result['body']['container']['data']['products']['pageInfo']['endCursor'];
                $hasNextPage = $result['body']['container']['data']['products']['pageInfo']['hasNextPage'];
                $hasPreviousPage = $result['body']['container']['data']['products']['pageInfo']['hasPreviousPage'];
                $products = $result['body']['container']['data']['products']['edges'];

                $productsObject = [
                    'data' => $products,
                    'path' => route('cropica.fetch.products'),
                    'per_page' => (int) $request->page_count,
                    'next_cursor' => $hasNextPage ? $endCursor : null,
                    'next_page_url' => $hasNextPage ? route('cropica.fetch.products') . '?cursor=' . $endCursor : null,
                    'prev_cursor' => $hasPreviousPage ? $startCursor : null,
                    'prev_page_url	' => $hasPreviousPage ? (route('cropica.fetch.products') . '?cursor=' . $startCursor) : null,
                ];
            }

            $collections = Collection::where('user_id', $storeID)->get();
            $vendors = ShopifyVendor::all();
            $data['collections'] = $collections;
            $data['vendors'] = $vendors;
            return response()->json(['success' => true, 'data' => $productsObject, 'filters' => $data]);
        }
        return Inertia::render('Applications/Cropica/FetchProducts/FetchProducts');
    }

    public function initiateImageCropping(Request $request)
    {
        $retry = $request->retry;
        $existingCropicaJobId = $request->existingCropicaJobId;

        if (session()->has('job_delay') && (int) session('job_delay') > 0) {
            $currentDelay = (int) session('job_delay');
            session(['job_delay' => $currentDelay + 5]);
        } else {
            session(['job_delay' => 1]);
        }

        $job_delay = session('job_delay');
        // Log::info('Job Delay >> ' . session('job_delay'));
        if ($request->has('store') && $request->store > 0) {

            $storeID = $request->store;
            $store = User::where('id', $storeID)->first();

            if ($request->has('allProducts') && $request->allProducts == 'allProducts') {
                $type = "allproducts";
                $productsCountQuery = <<<QUERY
                {
                    productsCount {
                        count
                    }
                }
                QUERY;

                $result = $store->api()->graph($productsCountQuery);
                $productCount = $result['body']['container']['data']['productsCount']['count'];

                $cropicaJob = CropicaJob::create([
                    'uuid' => (string) Str::uuid(),
                    'store_id' => $storeID,
                    'store_name' => $store->store_name,
                    'type' => 'allproducts',
                    'status' => 'InQueue',
                    'total_products' => (int) $productCount,
                    'total_images' => 0,
                    'processed_images' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $cropicaJob->logs()->create([
                    'user_id' => $store->id,
                    'priority' => TRUE,
                    'type' => 'info',
                    'description' => 'Image Croping started for all products related to store: ' . ($store->store_name ? $store->store_name : $store->name),
                ]);

                $processJob = new ProcessProductImageResize($store, $type, [], $_SERVER['DOCUMENT_ROOT'], $cropicaJob);
                dispatch($processJob);
            } else if ($request->has('selectedResources') && count($request->selectedResources) > 0) {
                $type = "miscellaneous";
                $request_data = $request->selectedResources;
                $productCount = count($request_data);
                $formatted_ids = '"' . implode('", "', $request_data) . '"';

                if($retry && $existingCropicaJobId) {

                    CropicaJobFailedProduct::where('cropica_job_id', $existingCropicaJobId)->delete();

                    $cropicaJob = CropicaJob::find($existingCropicaJobId);

                    $cropicaJob->logs()->create([
                        'user_id' => $store->id,
                        'priority' => TRUE,
                        'type' => 'info',
                        'description' => 'Image Croping started again for failed products having shopify id: ' . implode(",", $request->selectedResources) . ' and related to store: ' . ($store->store_name ? $store->store_name : $store->name),
                    ]);
                } else {
                    $cropicaJob = CropicaJob::create([
                        'uuid' => (string) Str::uuid(),
                        'store_id' => $storeID,
                        'store_name' => $store->store_name,
                        'type' => 'miscellaneous',
                        'status' => 'InQueue',
                        'total_products' => $productCount,
                        'total_images' => 0,
                        'processed_images' => 0,
                        'products_list' => $formatted_ids,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    
                    $cropicaJob->logs()->create([
                        'user_id' => $store->id,
                        'priority' => TRUE,
                        'type' => 'info',
                        'description' => 'Image Croping started for all selected products having shopify id: ' . implode(",", $request->selectedResources) . ' and related to store: ' . ($store->store_name ? $store->store_name : $store->name),
                    ]);
                }

                $processJob = new ProcessProductImageResize($store, $type, $request->selectedResources, $_SERVER['DOCUMENT_ROOT'], $cropicaJob, $retry);
                dispatch($processJob);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Croping Initiated.',
            ], 200);
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Store Selection Needed.',
            ], 400);
        }
    }

    public function fetchHistory(Request $request)
    {
        $jobs = CropicaJob::with([
            'user' => function ($query) {
                $query->orderBy('id', 'desc');
            },
            'logs' => function ($query) {
                $query->orderBy('id', 'desc');
            },
            'failed_products' => function ($query) {
                $query->orderBy('id', 'desc');
            },
        ])->when($request->get('q'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->where('store_name', 'LIKE', '%' . $request->q . '%')
                    ->orWhereHas('user', function ($q) use ($request) {
                        $q->where('users.name', 'LIKE', '%' . $request->q . '%');
                    });
            });
        })->when($request->get('q2'), function ($q) use ($request) {
            $q->whereHasIn('user', function ($q) use ($request) {
                $q->whereIn('id', json_decode($request->q2));
            });
        })->when($request->get('q3'), function ($q) use ($request) {
            $q->whereIn('status', json_decode($request->q3));
        })->when($request->get('sort'), function ($q) use ($request) {
            $q->orderBy(...explode(' ', $request->get('sort')));
        })->cursorPaginate($request->page_count ? $request->page_count : 100);

        $users = User::whereNotNull('password')->where('role_id', 2)->orderBy('store_name', 'desc')->get();

        return sendResponse(true, 'Cropica Jobs retrieved successfully!', $jobs, $users);
    }

    public function cancelJob(Request $request)
    {
        $validator = validator($request->all(), [
            'job_id' => 'required|integer',
        ]);
        if ($validator->fails()) {
            return sendResponse(false, $validator->errors()->first());
        }
        $cropicaJob = CropicaJob::find($request->input('job_id'));
        if ($cropicaJob) {
            $cropicaJob->jobs()->delete();
            $cropicaJob->jobs()->detach();
        }
        $cropicaJob->update(['status' => 'Cancelled']);
        return sendResponse(true, 'Job Cancelled Successfully');
    }
}
