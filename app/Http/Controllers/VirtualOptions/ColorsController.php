<?php

namespace App\Http\Controllers\VirtualOptions;

use App\Http\Controllers\Controller;
use App\Models\AllInOne\User;
use App\Models\VirtualOptions\Color;
use App\Models\VirtualOptions\ColorFamily;
use App\Models\VirtualOptions\Family;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ColorsController extends Controller
{
    public function get_colors_list(Request $request)
    {
        //REAL PIVOT TABLE
        // $rules = Color::with(['families', 'users']

        $rules = Color::with(['families', 'colors_rel'])
            ->when($request->has('status'), function ($q) use ($request) {
                $q->when($request->status == 0, function ($q) use ($request) {
                    $q->where('status', $request->status);
                });
                $q->when($request->status == 1, function ($q) use ($request) {
                    $q->where('status', $request->status);
                });
            })->when($request->get('q'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->where('color', 'LIKE', '%' . $request->q . '%');
                });
            })->when($request->get('q2'), function ($q) use ($request) {
                $q->whereHasIn('families', function ($q) use ($request) {
                    $q->whereIn('families.id', json_decode($request->q2));
                });
            })->when($request->get('q3'), function ($q) use ($request) {
                $q->whereDoesntHaveIn('families', function ($q) use ($request) {
                    $q->whereIn('families.id', json_decode($request->q3));
                });
            })->when($request->get('family_id'), function ($q) use ($request) {
                $q->whereHasIn('families', function ($q) use ($request) {
                    $q->where('families.id', $request->family_id);
                });
            })->when($request->get('q4'), function ($q) use ($request) {
                $q->whereHasIn('colors_rel', function ($q) use ($request) {
                    // dd(json_decode($request->q4));
                    $q->whereIn('user_colors.user_id', json_decode($request->q4));
                });
            })
            // REAL PIVOT TABLE
            // ->when($request->get('q4'), function ($q) use ($request) {
            //     $q->whereHasIn('users', function ($q) use ($request) {
            //         $q->whereIn('users.id', json_decode($request->q4));
            //     });
            // })
            ->cursorPaginate($request->page_count ? $request->page_count : 5);

        return sendResponse(true, 'Colors retrieved successfully!', $rules);
    }

    public function color_families_list()
    {
        $families = Family::get();
        $stores = User::where('role_id', 2)->orderBy('store_name', 'asc')->get();
        return responseJson(true, 'Color families recieved', $families, $stores);
    }

    public function add_color_family(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required',
        ], []);

        if ($validator->fails()) {
            return simpleValidate($validator);
        } else {

            // return $request;

            $new_family = new Family;
            $new_family->name = $request->name;
            $new_family->save();

            return sendResponse(true, 'New Color Family Added');
        }
    }

    //THIS
    public function assign_color_family(Request $request)
    {
        // return $request;

        $color_ids = json_decode($request->color_ids);
        $families = json_decode($request->families);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;

        if ($all_check == "true") {
            parse_str($search_query, $params);

            $color_ids = Color::with('families')->when(isset($params['q']), function ($q) use ($params) {
                $q->where(function ($q) use ($params) {
                    $q->where('color', 'LIKE', '%' . $params['q'] . '%');
                });
            })->when(isset($params['q2']), function ($q) use ($params) {
                $q->whereHasIn('families', function ($q) use ($params) {
                    $q->whereIn('families.id', json_decode($params['q2']));
                });
            })->get()->pluck('id');
        }

        if (count($color_ids) == 0)
            return sendResponse(false, 'At least select one color!');

        DB::beginTransaction();
        try {

            // return $color_ids;
            $family_ids = collect($families)->pluck('value');

            foreach ($color_ids as $key => $value) {

                $color = Color::find($value);
                if (isset($request->sync_only))
                    $color->families()->sync($family_ids);
                else
                    $color->families()->syncWithoutDetaching($family_ids);
            }

            DB::commit();

            $assigned_colors = Color::whereHasIn('families')->get();
            $assigned_colors->each->update(['status' => true]);
            $unassigned_colors = Color::whereDoesntHaveIn('families')->get();
            $unassigned_colors->each->update(['status' => false]);

            return sendResponse(true, 'Families assigned to colors.');
            //
        } catch (\Exception $th) {
            return $th;
        }
    }

    //THIS
    public function remove_color_family(Request $request)
    {
        // return $request;

        $color_ids = json_decode($request->color_ids);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;

        if ($all_check == "true") {
            parse_str($search_query, $params);

            $color_ids = Color::with('families')->when(isset($params['q']), function ($q) use ($params) {
                $q->where(function ($q) use ($params) {
                    $q->where('color', 'LIKE', '%' . $params['q'] . '%');
                });
            })->when(isset($params['q2']), function ($q) use ($params) {
                $q->whereHasIn('families', function ($q) use ($params) {
                    $q->whereIn('families.id', json_decode($params['q2']));
                });
            })->get()->pluck('id');
        }

        if (count($color_ids) == 0)
            return sendResponse(false, 'At least select one color!');

        DB::beginTransaction();
        try {

            foreach ($color_ids as $key => $value) {

                if (isset($request->family_id)) {
                    ColorFamily::where('family_id', $request->family_id)->where('color_id', $value)->delete();
                } else {
                    $color = Color::find($value);
                    $color->families()->sync([]);
                }
            }

            DB::commit();

            $assigned_colors = Color::whereHasIn('families')->get();
            $assigned_colors->each->update(['status' => true]);
            $unassigned_colors = Color::whereDoesntHaveIn('families')->get();
            $unassigned_colors->each->update(['status' => false]);

            return sendResponse(true, 'Family removed from colors.');
            //
        } catch (\Exception $th) {
            return $th;
        }
    }

    public function update_family_name(Request $request)
    {
        if (!isset($request->name))
            return sendResponse(false, 'The name field is required.');

        $update_family = Family::find($request->editing_id);
        $update_family->name = $request->name;
        $update_family->save();

        return sendResponse(true, 'Family name Updated.');
    }

    public function get_family_editing_data(Request $request)
    {
        // return $request;

        $family = Family::find($request->editing_id);

        $object['data1'] = $family;

        return sendResponse(true, 'Family and its colors shown', $object);
    }

    public function delete_family(Request $request)
    {
        ColorFamily::where('family_id', $request->editing_id)->delete();

        $family = Family::find($request->editing_id);
        $family->delete();

        return sendResponse(true, 'Family deleted and Its colors Unasigned');
    }

    public function get_color_and_its_families(Request $request)
    {
        // return $request;
        $color = Color::find($request->color_id)->load(['families']);
        return sendResponse(true, 'Family and its colors shown', $color);
    }
}
