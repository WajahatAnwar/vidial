<?php

namespace App\Http\Controllers\Analytics;

use App\Exports\Analytics\ProductExport;
use App\Http\Controllers\Controller;
use App\Models\AllInOne\ProductVariant;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ProductController extends Controller
{
    public function productsList(Request $request)
    {
        $products = ProductVariant::with(['product', 'product.user', 'product.collections'])
            ->when($request->has('status'), function ($q) use ($request) {
                $q->when($request->status == '0', function ($q) {
                    $q->whereHasIn('product', function ($q) {
                        $q->where('status', 'draft');
                    });
                });
                $q->when($request->status == '1', function ($q) {
                    $q->whereHasIn('product', function ($q) {
                        $q->where('status', 'active');
                    });
                });
            })->when($request->get('q'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->orWhere('title', 'LIKE', '%' . $request->q . '%');
                    $q->orWhere('product_id', 'LIKE', '%' . $request->q . '%');
                    $q->orWhere('variant_id', 'LIKE', '%' . $request->q . '%');
                });
            })->when($request->get('q3'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->whereIn('user_id', json_decode($request->q3));
                });
            })->when($request->get('q4'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->orWhere('title', 'LIKE', '%' . $request->q4 . '%');
                    $q->orWhere('product_id', 'LIKE', '%' . $request->q4 . '%');
                    $q->orWhere('variant_id', 'LIKE', '%' . $request->q4 . '%');
                });
            })->when($request->get('q5'), function ($q) use ($request) {
                $q->when($request->get('q5') == "id asc", function ($q) {
                    $q->orderBy("id", "asc");
                });
                $q->when($request->get('q5') == "id desc", function ($q) {
                    $q->orderBy("id", "desc");
                });
                $q->when($request->get('q5') == "product asc", function ($q) {
                    $q->orderBy("product_id", "asc");
                });
                $q->when($request->get('q5') == "product desc", function ($q) {
                    $q->orderBy("product_id", "desc");
                });
                $q->when($request->get('q5') == "variant asc", function ($q) {
                    $q->orderBy("variant_id", "asc");
                });
                $q->when($request->get('q5') == "variant desc", function ($q) {
                    $q->orderBy("variant_id", "desc");
                });
                $q->when($request->get('q5') == "price asc", function ($q) {
                    $q->orderBy("price", "asc");
                });
                $q->when($request->get('q5') == "price desc", function ($q) {
                    $q->orderBy("price", "desc");
                });
            })->when($request->get('q6'), function ($q) use ($request) {
                $q->whereHasIn('product.collections', function ($q) use ($request) {
                    $q->whereIn('collections.collection_id', json_decode($request->q6));
                });
            })->when($request->get('q7'), function ($q) use ($request) {
                $q->whereHasIn('product', function ($q) use ($request) {
                    $q->where('product_vendor', json_decode($request->q7));
                });
            })
            ->cursorPaginate($request->page_count);

        return responseJson(true, 'Variants retrieved successfully!', $products);
    }

    public function exportProducts(Request $request)
    {
        $product_ids = explode(",", $request->product_ids);
        return Excel::download(new ProductExport($product_ids), 'Products.csv');
    }

    //THIS
    public function exportProductsRefine(Request $request)
    {
        $products_ids = json_decode($request->products_ids);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;

        // return $request;

        if ($all_check == "true") {
            parse_str($search_query, $params);

            // return $params;

            $products_ids = ProductVariant::with(['product', 'product.user', 'product.collections'])->when(isset($params['q']), function ($q) use ($params) {
                $q->where(function ($q) use ($params) {
                    $q->orWhere('title', 'LIKE', '%' . $params['q'] . '%');
                    $q->orWhere('product_id', 'LIKE', '%' . $params['q'] . '%');
                    $q->orWhere('variant_id', 'LIKE', '%' . $params['q'] . '%');
                });
            })->when(isset($params['q3']), function ($q) use ($params) {
                $q->where(function ($q) use ($params) {
                    $q->whereIn('user_id', json_decode($params['q3']));
                });
            })->when(isset($params['q4']), function ($q) use ($params) {
                $q->where(function ($q) use ($params) {
                    $q->orWhere('title', 'LIKE', '%' . $params['q4'] . '%');
                    $q->orWhere('product_id', 'LIKE', '%' . $params['q4'] . '%');
                    $q->orWhere('variant_id', 'LIKE', '%' . $params['q4'] . '%');
                });
            })->when(isset($params['q6']), function ($q) use ($params) {
                $q->whereHasIn('product.collections', function ($q) use ($params) {
                    $q->whereIn('collections.collection_id', json_decode($params['q6']));
                });
            })->when(isset($params['q7']), function ($q) use ($params) {
                $q->whereHasIn('product', function ($q) use ($params) {
                    $q->whereIn('product_vendor', json_decode($params['q7']));
                });
            })->get()->pluck('id');
        }

        return responseJson(true, 'Refine Export Products', $products_ids);
    }
}
