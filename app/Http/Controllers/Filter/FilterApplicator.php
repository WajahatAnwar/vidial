<?php

namespace App\Http\Controllers\Filter;

use App\Http\Controllers\Controller;
use App\Models\AllInOne\Collection;
use App\Models\AllInOne\User;
use App\Models\Filter\FilterSet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FilterApplicator extends Controller
{
    public function get_collections_list(Request $request)
    {
        $collections = Collection::with(['user', 'filter_set'])
            ->when($request->has('status'), function ($q) use ($request) {
                $q->when($request->status == '0', function ($q) {
                    $q->whereNull('filter_set_id');
                });
                $q->when($request->status == '1', function ($q) {
                    $q->whereNotNull('filter_set_id');
                });
            })
            ->when($request->get('q'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->where('collection_title', 'LIKE', '%' . $request->q . '%');
                });
            })->when($request->get('q2'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->whereIn('filter_set_id', json_decode($request->q2));
                });
            })->when($request->get('q3'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->whereIn('user_id', json_decode($request->q3));
                });
            })->cursorPaginate($request->page_count);

        return sendResponse(true, 'Collections retrieved successfully!', $collections);
    }

    public function applicator_filters(Request $request)
    {
        $users = User::where('role_id', 2)->orderBy('store_name', 'asc')->whereNotNull('store_name')->get();
        $filter_sets = FilterSet::orderBy('name', 'asc')->get();

        $object['users'] = $users;
        $object['filter_sets'] = $filter_sets;

        return sendResponse(true, 'Filters recieved', $object);
    }

    //THIS
    public function assign_filter_set(Request $request)
    {
        // return $request;

        $collections_ids = json_decode($request->collections_ids);
        $filter_set = json_decode($request->filter_set);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;

        if ($request->filter_set == "false")
            return sendResponse(false, 'At least Select 1 Filter Set!');

        if ($all_check == "true") {
            parse_str($search_query, $params);

            $collections_ids = Collection::with(['user', 'filter_set'])
                ->when(isset($params['q']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->where('collection_title', 'LIKE', '%' . $params['q'] . '%');
                    });
                })->when(isset($params['q2']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->whereIn('filter_set_id', json_decode($params['q2']));
                    });
                })->when(isset($params['q3']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->whereIn('user_id', json_decode($params['q3']));
                    });
                })->get()->pluck('id');
        }

        // return $collections_ids;

        if (count($collections_ids) == 0)
            return sendResponse(false, 'At least select one collection!');

        DB::beginTransaction();
        try {

            foreach ($collections_ids as $key => $value) {

                $product = Collection::find($value);
                $product->filter_set_id = $filter_set->value;
                $product->save();
            }

            DB::commit();

            return sendResponse(true, 'Filter Set assigned to collections.');
            //
        } catch (\Exception $th) {
            return $th;
        }
    }

    //THIS
    public function assign_colleciton_sort(Request $request)
    {
        // return $request;

        $collections_ids = json_decode($request->collections_ids);
        $sort = $request->sort;
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;

        if ($request->filter_set == "false")
            return sendResponse(false, 'At least Select 1 Filter Set!');

        if ($all_check == "true") {
            parse_str($search_query, $params);

            $collections_ids = Collection::with(['user', 'filter_set'])
                ->when(isset($params['q']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->where('collection_title', 'LIKE', '%' . $params['q'] . '%');
                    });
                })->when(isset($params['q2']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->whereIn('filter_set_id', json_decode($params['q2']));
                    });
                })->when(isset($params['q3']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->whereIn('user_id', json_decode($params['q3']));
                    });
                })->get()->pluck('id');
        }

        // return $collections_ids;

        if (count($collections_ids) == 0)
            return sendResponse(false, 'At least select one collection!');

        DB::beginTransaction();
        try {

            foreach ($collections_ids as $key => $value) {

                $product = Collection::find($value);
                $product->collection_sort = $sort;
                $product->save();
            }

            DB::commit();

            return sendResponse(true, 'Filter Set assigned to collections.');
            //
        } catch (\Exception $th) {
            return $th;
        }
    }

    //THIS
    public function remove_filter_set(Request $request)
    {
        $collections_ids = json_decode($request->collections_ids);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;

        if ($all_check == "true") {
            parse_str($search_query, $params);

            $collections_ids = Collection::with(['user', 'filter_set'])
                ->when(isset($params['q']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->where('collection_title', 'LIKE', '%' . $params['q'] . '%');
                    });
                })->when(isset($params['q2']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->whereIn('filter_set_id', json_decode($params['q2']));
                    });
                })->when(isset($params['q3']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->whereIn('user_id', json_decode($params['q3']));
                    });
                })->get()->pluck('id');
        }

        // return $collections_ids;

        if (count($collections_ids) == 0)
            return sendResponse(false, 'At least select one product!');

        DB::beginTransaction();
        try {
            foreach ($collections_ids as $key => $value) {
                $product = Collection::find($value);
                $product->filter_set_id = NULL;
                $product->save();
            }
            DB::commit();
            return sendResponse(true, 'Filter Set unassigned to collections.');
            //
        } catch (\Exception $th) {
            return $th;
        }
    }

    public function assignFilterSetStore(Request $request)
    {
        $store_ids = json_decode($request->users_ids);
        $filter_set = json_decode($request->filter_set);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;
        if ($request->filter_set == "false")
            return sendResponse(false, 'At least Select 1 Filter Set!');

        if ($all_check == "true") {
            parse_str($search_query, $params);

            $store_ids = User::when(isset($params['q3']), function ($q) use ($params) {
                $q->where(function ($q) use ($params) {
                    $q->where('store_name', 'LIKE', '%' . $params['q3'] . '%');
                });
            })->get()->pluck('id');
        }

        // return $collections_ids;

        if (count($store_ids) == 0)
            return sendResponse(false, 'At least select one collection!');

        DB::beginTransaction();
        try {

            foreach ($store_ids as $key => $value) {

                $user = User::find($value);
                $user->default_filter_set_id = $filter_set->value;
                $user->save();
            }

            DB::commit();

            return sendResponse(true, 'Filter Set assigned to store.');
            //
        } catch (\Exception $th) {
            return $th;
        }
    }

    public function getStoresList(Request $request)
    {
        $stores = User::with('filter_set')->where('role_id',2)
            ->when($request->has('status'), function ($q) use ($request) {
                $q->when($request->status == '0', function ($q) {
                    $q->whereNull('default_filter_set_id');
                });
                $q->when($request->status == '1', function ($q) {
                    $q->whereNotNull('default_filter_set_id');
                });
            })
        ->when($request->get('q'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->where('store_name', 'LIKE', '%' . $request->q . '%');
            });
        })->orderBy('store_name', 'asc')
        ->whereNotNull('password')
        ->cursorPaginate($request->page_count);
        return sendResponse(true, 'Stores retrieved successfully!', $stores);
    }

    public function removeDefaultFilterSet(Request $request)
    {
       $store_ids = json_decode($request->store_ids);
        $filter_set = json_decode($request->filter_set);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;
        if ($request->filter_set == "false")
            return sendResponse(false, 'At least Select 1 Filter Set!');

        if ($all_check == "true") {
            parse_str($search_query, $params);

            $store_ids = User::when(isset($params['q3']), function ($q) use ($params) {
                $q->where(function ($q) use ($params) {
                    $q->where('store_name', 'LIKE', '%' . $params['q3'] . '%');
                });
            })->get()->pluck('id');
        }

        // return $collections_ids;

        if (count($store_ids) == 0)
            return sendResponse(false, 'At least select one user!');

        DB::beginTransaction();
        try {
            foreach ($store_ids as $key => $value) {
                $user = User::find($value);
                $user->default_filter_set_id = NULL;
                $user->save();
            }
            DB::commit();
            return sendResponse(true, 'Filter Set unassigned to stores.');
            //
        } catch (\Exception $th) {
            return $th;
        }
    }

    public function change_status(Request $request)
    {
        $user = User::find($request->user_id);
        $user->show_inventory = $request->status;
        $user->save();
        return responseJson(true, 'Inventory Show/Hide status updated Successfully');
    }
    public function updateColors(Request $request)
    {
        // logger($request->all());
        $user = User::find($request->user_id);
        $user->in_stock_color = $request->in_stock_bg;
        $user->on_sale_color = $request->on_sale_bg;
        $user->in_stock_text_color = $request->in_stock_text_color;
        $user->on_sale_text_color = $request->on_sale_text_color;
        $user->save();
        return responseJson(true, 'Color updated Successfully');
    }
}
