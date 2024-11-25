<?php

namespace App\Http\Controllers\Analytics;

use App\Exports\Analytics\CollectionExport;
use App\Http\Controllers\Controller;
use App\Models\AllInOne\Collection;
use App\Models\AllInOne\User;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class CollectionController extends Controller
{
    public function collectionsList(Request $request)
    {
        // $collections = $this->collectionRepository->allCollections($request);
        // if ($collections) {
        //     $data['collections'] = $collections;
        //     return responseJson(true, 'Collections List Fetched Successfully', $data);
        // }
        // return responseJson(false, 'Data not found', null);

        $products = Collection::with(['user'])->withCount(['products'])
            ->when($request->get('q'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->orWhere('collection_title', 'LIKE', '%' . $request->q . '%');
                    $q->orWhere('collection_id', 'LIKE', '%' . $request->q . '%');
                });
            })->when($request->get('q3'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->whereIn('user_id', json_decode($request->q3));
                });
            })->when($request->get('q4'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->orWhere('collection_title', 'LIKE', '%' . $request->q4 . '%');
                    $q->orWhere('collection_id', 'LIKE', '%' . $request->q4 . '%');
                });
            })->when($request->get('q5'), function ($q) use ($request) {
                $q->when($request->get('q5') == "id asc", function ($q) {
                    $q->orderBy("id", "asc");
                });
                $q->when($request->get('q5') == "id desc", function ($q) {
                    $q->orderBy("id", "desc");
                });
                $q->when($request->get('q5') == "collection asc", function ($q) {
                    $q->orderBy("collection_id", "asc");
                });
                $q->when($request->get('q5') == "collection desc", function ($q) {
                    $q->orderBy("collection_id", "desc");
                });
            })->cursorPaginate($request->page_count);

        return responseJson(true, 'Collctions retrieved successfully!', $products);
    }

    public function get_dashboard_data()
    {
        $user = User::find(2);
        $response = $user->api()->rest('GET', '/admin/api/2023-04/webhooks.json');
        return responseJson(true, 'Webhooks List Shown', $response);
    }

    public function exportCollections(Request $request)
    {
        $collection_ids = explode(",", $request->collection_ids);
        return Excel::download(new CollectionExport($collection_ids), 'Collections.csv');
    }

    //THIS
    public function exportCollectionsRefine(Request $request)
    {
        $collections_ids = json_decode($request->collections_ids);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;

        if ($all_check == "true") {
            parse_str($search_query, $params);

            // return $params;

            $collections_ids = Collection::with(['user'])->withCount(['products'])
                ->when(isset($params['q']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->orWhere('collection_title', 'LIKE', '%' . $params['q'] . '%');
                        $q->orWhere('collection_id', 'LIKE', '%' . $params['q'] . '%');
                    });
                })->when(isset($params['q3']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->whereIn('user_id', json_decode($params['q3']));
                    });
                })->when(isset($params['q4']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->orWhere('collection_title', 'LIKE', '%' . $params['q4'] . '%');
                        $q->orWhere('collection_id', 'LIKE', '%' . $params['q4'] . '%');
                    });
                })->get()->pluck('id');
        }

        return responseJson(true, 'Refine Export Collection', $collections_ids);
    }
}
