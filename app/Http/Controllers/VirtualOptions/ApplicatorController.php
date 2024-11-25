<?php

namespace App\Http\Controllers\VirtualOptions;

use App\Http\Controllers\Controller;

use App\Models\AllInOne\Collection;
use App\Models\VirtualOptions\OptionSet;
use App\Models\AllInOne\Product;
use App\Models\AllInOne\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ApplicatorController extends Controller
{
    public function get_products_list(Request $request)
    {
        $products = Product::with(['user', 'option_set', 'collections'])
            ->when($request->has('status'), function ($q) use ($request) {
                $q->when($request->status == '0', function ($q) {
                    $q->whereNull('option_set_id');
                });
                $q->when($request->status == '1', function ($q) {
                    $q->whereNotNull('option_set_id');
                });
            })->when($request->get('q'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->where('product_title', 'LIKE', '%' . $request->q . '%')
                        ->orWhere('product_vendor', 'LIKE', '%' . $request->q . '%');
                });
            })->when($request->get('q2'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->whereIn('option_set_id', json_decode($request->q2));
                });
            })->when($request->get('q3'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->whereIn('user_id', json_decode($request->q3));
                });
            })->when($request->get('q4'), function ($q) use ($request) {
                $q->whereHasIn('collections', function ($q) use ($request) {
                    $q->whereIn('collections.collection_id', json_decode($request->q4));
                });
            })->when($request->get('q5'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->whereIn('product_vendor', json_decode($request->q5));
                });
            })->cursorPaginate($request->page_count);

        return sendResponse(true, 'Products retrieved successfully!', $products);
    }

    public function applicator_filters(Request $request)
    {
        $users = User::where('role_id', 2)->orderBy('store_name', 'asc')->whereNotNull('store_name')->get();
        $option_sets = OptionSet::orderBy('name', 'asc')->get();

        $collections = Collection::when($request->get('user_id'), function ($q) use ($request) {
            $q->where('user_id', $request->user_id);
        })->get();

        $vendors = Product::when($request->get('user_id'), function ($q) use ($request) {
            $q->where('user_id', $request->user_id);
        })->select('product_vendor')->distinct()->get();

        $object['users'] = $users;
        $object['option_sets'] = $option_sets;
        $object['collections'] = $collections;
        $object['vendors'] = $vendors;

        return sendResponse(true, 'Filters recieved', $object);
    }

    //THIS
    public function assign_option_set(Request $request)
    {
        // return $request;

        $products_ids = json_decode($request->products_ids);
        $option_set = json_decode($request->option_set);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;

        if ($request->option_set == "false")
            return sendResponse(false, 'At least Select 1 Option Set!');

        if ($all_check == "true") {
            parse_str($search_query, $params);

            $products_ids = Product::with(['user', 'option_set', 'collections'])
                ->when(isset($params['q']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->where('product_title', 'LIKE', '%' . $params['q'] . '%')
                            ->orWhere('product_vendor', 'LIKE', '%' . $params['q'] . '%');
                    });
                })->when(isset($params['q2']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->whereIn('option_set_id', json_decode($params['q2']));
                    });
                })->when(isset($params['q3']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->whereIn('user_id', json_decode($params['q3']));
                    });
                })->when(isset($params['q4']), function ($q) use ($params) {
                    $q->whereHasIn('collections', function ($q) use ($params) {
                        $q->whereIn('collections.collection_id', json_decode($params['q4']));
                    });
                })->when(isset($params['q5']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->whereIn('product_vendor', json_decode($params['q5']));
                    });
                })->get()->pluck('id');
        }

        // return $products_ids;

        if (count($products_ids) == 0)
            return sendResponse(false, 'At least select one product!');

        DB::beginTransaction();
        try {

            foreach ($products_ids as $key => $value) {

                $product = Product::find($value);
                $product->option_set_id = $option_set->value;
                $product->save();
            }

            DB::commit();

            return sendResponse(true, 'Option Set assigned to products.');
            //
        } catch (\Exception $th) {
            return $th;
        }
    }

    //THIS
    public function remove_option_set(Request $request)
    {
        $products_ids = json_decode($request->products_ids);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;

        if ($all_check == "true") {
            parse_str($search_query, $params);

            $products_ids = Product::with(['user', 'option_set', 'collections'])
                ->when(isset($params['q']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->where('product_title', 'LIKE', '%' . $params['q'] . '%')
                            ->orWhere('product_vendor', 'LIKE', '%' . $params['q'] . '%');
                    });
                })->when(isset($params['q2']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->whereIn('option_set_id', json_decode($params['q2']));
                    });
                })->when(isset($params['q3']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->whereIn('user_id', json_decode($params['q3']));
                    });
                })->when(isset($params['q4']), function ($q) use ($params) {
                    $q->whereHasIn('collections', function ($q) use ($params) {
                        $q->whereIn('collections.collection_id', json_decode($params['q4']));
                    });
                })->when(isset($params['q5']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->whereIn('product_vendor', json_decode($params['q5']));
                    });
                })->get()->pluck('id');
        }

        // return $products_ids;

        if (count($products_ids) == 0)
            return sendResponse(false, 'At least select one product!');

        DB::beginTransaction();
        try {
            foreach ($products_ids as $key => $value) {
                $product = Product::find($value);
                $product->option_set_id = NULL;
                $product->save();
            }
            DB::commit();
            return sendResponse(true, 'Option Set assigned to products.');
            //
        } catch (\Exception $th) {
            return $th;
        }
    }

    public function get_products_list_two(Request $request)
    {
        $shop = Auth::user();

        $products = Product::with(['user', 'option_set', 'collections'])
            ->when($request->has('status'), function ($q) use ($request) {
                $q->when($request->status == '0', function ($q) {
                    $q->whereNull('option_set_id');
                });
                $q->when($request->status == '1', function ($q) {
                    $q->whereNotNull('option_set_id');
                });
            })->when($request->get('q'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->where('product_title', 'LIKE', '%' . $request->q . '%')
                        ->orWhere('product_vendor', 'LIKE', '%' . $request->q . '%');
                });
            })->when($request->get('q2'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->whereIn('option_set_id', json_decode($request->q2));
                });
            })->where('user_id', $shop->id)
            ->when($request->get('q4'), function ($q) use ($request) {
                $q->whereHasIn('collections', function ($q) use ($request) {
                    $q->whereIn('collections.collection_id', json_decode($request->q4));
                });
            })->when($request->get('q5'), function ($q) use ($request) {
                $q->where('product_vendor', json_decode($request->q5));
            })->cursorPaginate($request->page_count);

        return sendResponse(true, 'Products retrieved successfully!', $products);
    }

    public function applicator_filters_two(Request $request)
    {
        $option_sets = OptionSet::get();

        $collections = Collection::where('user_id', Auth::user()->id)->get();

        $vendors = Product::where('user_id', Auth::user()->id)->select('product_vendor')->distinct()->get();

        $object['option_sets'] = $option_sets;
        $object['collections'] = $collections;
        $object['vendors'] = $vendors;

        return sendResponse(true, 'Filters recieved', $object);
    }
}
