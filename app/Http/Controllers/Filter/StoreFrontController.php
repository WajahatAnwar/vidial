<?php

namespace App\Http\Controllers\Filter;

use App\Http\Controllers\Controller;
use App\Models\AllInOne\Collection;
use App\Models\Filter\FilterData;
use App\Models\AllInOne\CollectionProduct;
use App\Models\AllInOne\Product;
use App\Models\VirtualOptions\Color;
use App\Models\InConnect\ShopifySize;
use App\Models\AllInOne\ProductVariant;
use App\Models\AllInOne\User;
use App\Models\VirtualOptions\Family;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class StoreFrontController extends Controller
{
    public function get_collection_filters(Request $request)
    {
        $fine_filters = $request->filters;

        $user = User::where('name', $request->shop)->first();

        $current_collection = Collection::where('user_id', $user->id)->where('collection_id', $request->collection_id)->first();

        $products = Product::where('status','active')->whereNotNull('published_at')->where('products.user_id',$user->id)
        ->join('collection_products', 'products.product_id', '=', 'collection_products.product_id')
        ->where('collection_products.collection_id', $request->collection_id)       
        ->get()->map(function($value) {
            $value->new_product_tags = explode(',', $value->product_tags);
            return $value;
        });

        $all_tags_array = $products->pluck('new_product_tags')->flatten()->toArray();
        
        $query = ProductVariant::where('product_variants.user_id', $user->id)
        ->join('products', 'product_variants.product_id', '=', 'products.product_id')
        ->whereNotNull('products.published_at')       
        ->where('products.status', 'active')       
        ->join('collection_products', 'product_variants.product_id', '=', 'collection_products.product_id')
        ->where('collection_products.collection_id', $request->collection_id);       
        $query->select(['product_variants.*']);

        $queryTwo = $query->clone()->get();

        $all_options = [];
        $queryTwo->each(function ($item) use(&$all_options) {
            if($item->option1 != "")
                if(!in_array($item->option1,$all_options))
                    $all_options[] = $item->option1;
            if($item->option2 != "")
                if(!in_array($item->option2,$all_options))
                    $all_options[] = $item->option2;
            if($item->option3 != "")
                if(!in_array($item->option3,$all_options))
                    $all_options[] = $item->option3;
        });

        $all_system_sizes = ShopifySize::whereIn('name', $all_options)->select('name')->get()->pluck('name');

        $product_types = collect($products)->unique('product_type')->pluck('product_type');
        
        foreach ($fine_filters as $key => $filter) {

            // COLOR
            if ($filter['filter_type_id'] == 3) {

                $family_ids = [];
                foreach ($filter['options'] as $key2 => $option) {
                    if ($option['tick']) {
                        array_push($family_ids, $option['family_id']);
                    }
                }
                // Log::info($family_ids);

                $family_colors = Family::whereIn('id', $family_ids)->with('colors')->get();
                // Log::info($family_colors);

                $colors = $family_colors->pluck('colors')->flatten(1)->pluck('color')->toArray();

                // Log::info($colors);
                if (count($family_ids) > 0) {
                    $query->where(function ($q) use ($colors) {
                        $q->whereIn('option1', $colors);
                        $q->orWhereIn('option2', $colors);
                    });
                }
            }

            // SIZE
            if ($filter['filter_type_id'] == 4) {
                $mergedValues = [];

                foreach ($filter['options'] as $key2 => $option) {
                    if ($option['tick']) {
                        $mergedValues = array_merge($mergedValues, $option['values']);
                    }
                }

                // Log::info($mergedValues);
                if (count($mergedValues) > 0) {
                    $query->where(function ($q) use ($mergedValues) {
                        $q->whereIn('option1', $mergedValues);
                        $q->orWhereIn('option2', $mergedValues);
                    });
                }
            }

            // PRICE
            if ($filter['filter_type_id'] == 5) {

                $filter['minPrice'] = is_numeric($filter['minPrice']) ? $filter['minPrice'] : 0;
                $filter['maxPrice'] = is_numeric($filter['maxPrice']) ? $filter['maxPrice'] : 5000;

                $query->whereRaw('CAST(price AS DECIMAL) >= ' . $filter['minPrice']);
                $query->whereRaw('CAST(price AS DECIMAL) <= ' . $filter['maxPrice']);
            }
        }

        foreach ($fine_filters as $key1 => $filter) {

            // TAG
            if ($filter['filter_type_id'] == 1) {
                $query->whereHas('product', function ($q) use ($filter) {
                    $mergedValues = [];

                    foreach ($filter['options'] as $key2 => $option) {
                        if ($option['tick']) {
                            $mergedValues = array_merge($mergedValues, $option['values']);
                        }
                    }

                    // Log::info($mergedValues);
                    foreach ($mergedValues as $key2 => $value) {
                        if ($key2 == 0) {
                            $q->where('product_tags', 'LIKE', '%' . $value . '%');
                        } else {
                            $q->orWhere('product_tags', 'LIKE', '%' . $value . '%');
                        }
                    }
                });
            }

            // TYPE
            if ($filter['filter_type_id'] == 2) {
                $query->whereHas('product', function ($q) use ($filter) {
                    $mergedValues = [];

                    foreach ($filter['options'] as $key2 => $option) {
                        if ($option['tick']) {
                            $mergedValues = array_merge($mergedValues, $option['values']);
                        }
                    }

                    // Log::info($mergedValues);
                    foreach ($mergedValues as $key2 => $value) {
                        if ($key2 == 0) {
                            $q->where('product_type', 'LIKE', '%' . $value . '%');
                        } else {
                            $q->orWhere('product_type', 'LIKE', '%' . $value . '%');
                        }
                    }
                });
            }
        }

        $ids = $query->get()->unique('product_id')->values()->pluck('id');
        // return $ids;

        $query = ProductVariant::with(['product.images','product.user'])->where('product_variants.user_id',$user->id)->whereIn('product_variants.id', $ids)
        ->join('products', 'products.product_id', '=', 'product_variants.product_id')
        ->select('product_variants.*', 'products.*')
        ->where('product_variants.user_id', $user->id)
        ->when(true, function ($q) use ($request, $current_collection) {
            if($request->sort_by) {
                $sortBy = $request->sort_by;
            } else if ($current_collection){
                $sortBy = $current_collection->collection_sort;
            } else {
                $sortBy = 'id,asc';
            }

            if($sortBy == 'id,asc')
                $sortBy = 'products.id,asc';
            $sortBy = explode(",", $sortBy);
          
            if ($sortBy === 'price') {
                $q->orderByRaw("CAST(price AS DECIMAL(10,2)) $sortBy[1]");
            } else {
                $q->orderBy($sortBy[0], $sortBy[1]);
            }
        })->paginate(52);

        if(!$request->filtersLoaded) {

            //GETTING 1 COLLECTION FILTER SET
            $filter_set = Collection::with([
                'filter_set.filters.labels.values.filter_data',
                'filter_set.filters.labels' => function ($query) {
                    $query->orderBy('sort_number', 'asc');
                },
                'filter_set.filters.families.family.colors' => function ($query) {
                    $query->select('colors.id', 'colors.color'); // Specify the columns you want to retrieve
                },
                'filter_set.filters.filter_type',
                'filter_set.filters.sort_type',
                'filter_set.filters.default_state',
                'filter_set.filters' => function ($query) {
                    $query->orderBy('sort_number', 'asc');
                }
            ])->where('collection_id', $request->collection_id)->first();

            //GETTING 1 STORE DEFAULT FILTER SET
            if(!@$filter_set->filter_set) {
                $filter_set = User::where('id', $user->id)->with([
                    'filter_set.filters.labels.values.filter_data',
                    'filter_set.filters.labels' => function ($query) {
                        $query->orderBy('sort_number', 'asc');
                    },
                    'filter_set.filters.families.family.colors' => function ($query) {
                        $query->select('colors.id', 'colors.color'); // Specify the columns you want to retrieve
                    },
                    'filter_set.filters.filter_type',
                    'filter_set.filters.sort_type',
                    'filter_set.filters.default_state',
                    'filter_set.filters' => function ($query) {
                        $query->orderBy('sort_number', 'asc');
                    }
                ])->first();
            }

            if(isset($filter_set) && $filter_set->filter_set) {
                $filter_set->filter_set->filters->each(function ($item) use($products, $all_options, $all_tags_array, $all_system_sizes, $product_types) {
                    // Log::info(json_encode($item));

                    if($item->filter_type_id == 1 && $item->prefix) {

                        $tags = $products->pluck('new_product_tags')->flatten(1)->toArray();

                        $tags = array_filter($tags, function ($tag) use($item) {
                            return stripos($tag, $item->prefix) !== false;
                        });

                        $already_values = $item->labels->pluck('values')->flatten(1);
                        $already_values = $already_values->pluck('filter_data');
                        $already_values = $already_values->pluck('name');
                             
                        $tags = collect($tags)->filter(function($inside_unique_tag) use ($already_values) {  
                            return !in_array($inside_unique_tag, $already_values->toArray());
                        })->values()->toArray();
                        $tags = collect($tags)->map(function ($last_inside) use($item) {
                            return str_ireplace($item->prefix, "", $last_inside);
                        });

                        $unique_tags = collect($tags)->unique()->values();

                        $new_tags  = [];
                        collect($unique_tags)->each(function ($inside_size) use($item, &$new_tags){
                            $new_tags[] = [
                                "label" => $inside_size,
                                "values" => [[
                                    "filter_data" => [
                                        "name" => $inside_size
                                    ]
                                ]]
                            ];
                        });
                     
                        $item->familiesUpdated = $item->families;
                        $item->labelsUpdated = array_merge($item->labels->toArray(), $new_tags);

                    } else if($item->filter_type_id == 2){

                        $already_values = $item->labels->pluck('values')->flatten(1);
                        $already_values = $already_values->pluck('filter_data');
                        $already_values = $already_values->pluck('name');
                             
                        $product_types = $product_types->filter(function($inside_product_type) use ($already_values) {  
                            return !in_array($inside_product_type, $already_values->toArray());
                        })->values()->toArray();

                        $new_types = [];              
                        collect($product_types)->each(function ($inside_type) use($item, &$new_types){
                            $new_types[] = [
                                "label" => $inside_type,
                                "values" => [[
                                    "filter_data" => [
                                        "name" => $inside_type
                                    ]
                                ]]
                            ];
                        });

                        $item->familiesUpdated = $item->families;
                        $item->labelsUpdated = $new_types;
                        $item->labelsUpdated = array_merge($item->labels->toArray(), $new_types);
                    } else if($item->filter_type_id == 3){

                        $finalized_families = [];
                        $all_options_collection = collect($all_options);
                        $item->families->map(function($inside_family) use ($all_options, &$finalized_families) {
                            
                            $already_values = $inside_family->family->colors->pluck('color');
                            $response_count = array_intersect($already_values->toArray(), $all_options);

                            if(count($response_count) > 0)                            
                                $finalized_families[] = $inside_family;
                        });

                        $item->familiesUpdated = $finalized_families;
                        $item->labelsUpdated = $item->labels;
                    } else if($item->filter_type_id == 4){

                        $already_values = $item->labels->pluck('values')->flatten(1);
                        $already_values = $already_values->pluck('filter_data');
                        $already_values = $already_values->pluck('name');
                             
                        $all_system_sizes = $all_system_sizes->filter(function($inside_size) use ($already_values) {  
                            return !in_array($inside_size, $already_values->toArray());
                        })->values()->toArray();

                        $new_sizes  = [];
                        collect($all_system_sizes)->each(function ($inside_size) use($item, &$new_sizes){
                            $new_sizes[] = [
                                "label" => $inside_size,
                                "values" => [[
                                    "filter_data" => [
                                        "name" => $inside_size
                                    ]
                                ]]
                            ];
                        });

                        $item->familiesUpdated = $item->families;
                        $item->labelsUpdated = $new_sizes;
                        $item->labelsUpdated = array_merge($item->labels->toArray(), $new_sizes);
                    } else {
                        $item->labelsUpdated = $item->labels;
                        $item->familiesUpdated = $item->families;
                    }
                });
            }
        }

        return sendResponse(true, 'Collection and its filter retrieved successfully!', $query, @$filter_set);
    }

    public function data(Request $request) {
    }
}
