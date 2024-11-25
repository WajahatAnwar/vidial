<?php

namespace App\Http\Controllers\VirtualOptions;

use App\Http\Controllers\Controller;

use App\Models\VirtualOptions\Family;
use App\Models\VirtualOptions\Logo;
use App\Models\VirtualOptions\LogoAssignedGroup;
use App\Models\VirtualOptions\LogoFamily;
use App\Models\VirtualOptions\LogoGroup;
use App\Models\VirtualOptions\LogoGroupDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;

class LogoController extends Controller
{
    public function logos_list(Request $request)
    {
        $rules = Logo::with(['families', 'groups'])
            ->when($request->get('q'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->where('code_name', 'LIKE', '%' . $request->q . '%')
                        ->orWhere('color_hash', 'LIKE', '%' . $request->q . '%')
                        ->orWhere('tags', 'LIKE', '%' . $request->q . '%');
                });
            })->when($request->get('q2'), function ($q) use ($request) {
                $q->whereHasIn('families', function ($q) use ($request) {
                    $q->whereIn('families.id', json_decode($request->q2));
                });
            })->when($request->get('q3'), function ($q) use ($request) {
                $q->whereHasIn('groups', function ($q) use ($request) {
                    $q->whereIn('logo_groups.id', json_decode($request->q3));
                });
            })->when($request->get('logo_group_id'), function ($q) use ($request) {
                $q->whereHasIn('groups', function ($q) use ($request) {
                    $q->where('logo_groups.id', $request->logo_group_id);
                });
            })->when($request->get('family_id'), function ($q) use ($request) {
                $q->whereHasIn('families', function ($q) use ($request) {
                    $q->where('families.id', $request->family_id);
                });
            })->cursorPaginate($request->page_count ? $request->page_count : 5);
        return sendResponse(true, 'Logos retrieved successfully!', $rules);
    }


    public function add_logo_group(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required',
        ], []);

        if ($validator->fails()) {
            $str['success'] = false;
            $error = $validator->errors()->toArray();
            foreach ($error as $x_value) {
                $err[] = $x_value[0];
            }
            $str['message'] = $err['0'];
            return $str;
        } else {

            $new_family = new LogoGroup;
            $new_family->name = $request->name;
            $new_family->save();

            return sendResponse(true, 'New Logo Group Added.');
        }
    }

    public function get_add_logo_data(Request $request)
    {
        $groups = LogoGroup::get();
        $families = Family::get();

        $object['data1'] = $groups;
        $object['data2'] = $families;

        return sendResponse(true, 'All logo group and family data shown', $object);
    }

    public function add_logo(Request $request)
    {
        // return $request;
        // return $request->file('logo');

        $families = json_decode($request->selected_family);
        $groups = json_decode($request->selected_group);
        // return array($families, $groups);

        $validator = Validator::make($request->all(), [
            'logo_code' => 'required|alpha_dash|unique:virtual_options_conn.logos,code_name,' . $request->logo_id . '',
            'background_color' => 'required',
        ], []);

        if ($validator->fails()) {
            return simpleValidate($validator);
        } else {
            if ($request->logo_id != "false") {
                if (isset($request->logo)) {
                    $validator = Validator::make($request->all(), ['logo' => 'required|file|mimes:jpg,bmp,png,jpeg'], []);
                    if ($validator->fails())
                        return simpleValidate($validator);
                }
            } else {
                $validator = Validator::make($request->all(), ['logo' => 'required|file|mimes:jpg,bmp,png,jpeg'], []);
                if ($validator->fails())
                    return simpleValidate($validator);
            }

            DB::beginTransaction();
            try {
                $filename = "";
                if (isset($request->logo)) {
                    $file = $request->file('logo');
                    $filename = time() . '-' . $file->getClientOriginalName();
                    request()->logo->storeAs('public/uploaded_images', $filename);
                }

                if ($request->logo_id != "false") $new_logo = Logo::find($request->logo_id);
                else $new_logo = new Logo;

                $new_logo->code_name = $request->logo_code;
                $new_logo->color_hash = $request->background_color;
                if (isset($request->logo)) {
                    $new_logo->logo_image_link = 'storage/uploaded_images/' . $filename;
                }
                $new_logo->tags = $request->selected_tags;

                if (isset($request->stitch_count)) {
                    $new_logo->stitch_count = $request->stitch_count;
                } else {
                    $new_logo->stitch_count = NULL;
                }

                $new_logo->save();

                if (count($families) > 0)
                    $families = collect($families)->pluck('value');
                if (count($groups) > 0)
                    $groups = collect($groups)->pluck('value');

                $new_logo->families()->sync($families);
                $new_logo->groups()->sync($groups);

                DB::commit();

                if ($request->logo_id != "false")
                    $message =  'Existing Logo Updated.';
                else
                    $message =  'New Logo Added.';
                return sendResponse(true,  $message);
                //
            } catch (\Exception $th) {
                return $th;
            }
        }
    }

    public function get_logo_editing_data(Request $request)
    {
        $logo = Logo::find($request->logo_id)->load(['families', 'groups']);
        return sendResponse(true, 'Get editing logo data',  $logo);
    }

    public function logo_groups_list(Request $request)
    {
        $families = LogoGroup::get();
        return sendResponse(true, 'logo groups recieved', $families);
    }

    public function color_families_table(Request $request)
    {
        $rules = Family::when($request->get('q'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->where('name', 'LIKE', '%' . $request->q . '%');
            });
        })->cursorPaginate(5);
        return sendResponse(true, 'Color Families Retrieved successfully!', $rules);
    }

    //THIS
    public function assign_logo_color_families(Request $request)
    {
        $family_ids = json_decode($request->family_ids);
        $logo_ids = json_decode($request->logo_ids);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;

        if ($all_check == "true") {
            parse_str($search_query, $params);

            $logo_ids = Logo::with(['families', 'groups'])
                ->when(isset($params['q']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->where('code_name', 'LIKE', '%' . $params['q'] . '%')
                            ->orWhere('color_hash', 'LIKE', '%' . $params['q'] . '%')
                            ->orWhere('tags', 'LIKE', '%' . $params['q'] . '%');
                    });
                })->when(isset($params['q2']), function ($q) use ($params) {
                    $q->whereHasIn('families', function ($q) use ($params) {
                        $q->whereIn('families.id', json_decode($params['q2']));
                    });
                })->when(isset($params['q3']), function ($q) use ($params) {
                    $q->whereHasIn('groups', function ($q) use ($params) {
                        $q->whereIn('logo_groups.id', json_decode($params['q3']));
                    });
                })->get()->pluck('id');
        }

        // return $logo_ids;

        // return $request;
        // return $request->all_check;
        // return array($family_ids, $logo_ids);

        DB::beginTransaction();
        try {

            foreach ($logo_ids as $key => $logo) {

                $logo = Logo::find($logo);
                // return $logo;

                $logo->families()->sync($family_ids);
            }

            DB::commit();

            return sendResponse(true,  'Color Families assigned to logos.');
            //
        } catch (\Exception $th) {
            return $th;
        }
    }

    public function logo_groups_table(Request $request)
    {
        $rules = LogoGroup::when($request->get('q'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->where('name', 'LIKE', '%' . $request->q . '%');
            });
        })->cursorPaginate(5);
        return sendResponse(true, 'Logos Groups retrieved successfully!', $rules);
    }

    //THIS
    public function assign_logo_logo_groups(Request $request)
    {

        $logo_group_ids = json_decode($request->logo_group_ids);
        $logo_ids = json_decode($request->logo_ids);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;

        if ($all_check == "true") {
            parse_str($search_query, $params);

            $logo_ids = Logo::with(['families', 'groups'])
                ->when(isset($params['q']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->where('code_name', 'LIKE', '%' . $params['q'] . '%')
                            ->orWhere('color_hash', 'LIKE', '%' . $params['q'] . '%')
                            ->orWhere('tags', 'LIKE', '%' . $params['q'] . '%');
                    });
                })->when(isset($params['q2']), function ($q) use ($params) {
                    $q->whereHasIn('families', function ($q) use ($params) {
                        $q->whereIn('families.id', json_decode($params['q2']));
                    });
                })->when(isset($params['q3']), function ($q) use ($params) {
                    $q->whereHasIn('groups', function ($q) use ($params) {
                        $q->whereIn('logo_groups.id', json_decode($params['q3']));
                    });
                })->get()->pluck('id');
        }

        DB::beginTransaction();
        try {

            foreach ($logo_ids as $key => $logo) {

                $logo = Logo::find($logo);
                // return $logo;

                $logo->groups()->sync($logo_group_ids);
            }

            DB::commit();

            return sendResponse(true,  'Logo group assigned to logos.');
            //
        } catch (\Exception $th) {
            return $th;
        }
    }

    public function get_logo_group_editing_data(Request $request)
    {
        $logo_group = LogoGroup::find($request->editing_id);
        return sendResponse(true, 'Logo group data shown',  $logo_group);
    }

    public function update_logo_group_name(Request $request)
    {
        if (!isset($request->name))
            return sendResponse(false, 'The name field is required.');

        $update_logo_group = LogoGroup::find($request->editing_id);
        $update_logo_group->name = $request->name;
        $update_logo_group->save();

        return sendResponse(true, 'Logo group name Updated.');
    }

    public function delete_logo_group(Request $request)
    {
        // return $request;

        LogoAssignedGroup::where('logo_group_id', $request->editing_id)->delete();

        $logo_group = LogoGroup::find($request->editing_id);
        $logo_group->delete();

        return sendResponse(true, 'Logo Group deleted and Its assigned logos are Unassigned');
    }

    public function remove_logo(Request $request)
    {
        // return $request;

        $logos_ids = json_decode($request->logos_ids);

        if (count($logos_ids) == 0)
            return sendResponse(false, 'At least select one logo!');

        foreach ($logos_ids as $key => $value) {

            LogoAssignedGroup::where('logo_group_id', $request->logo_group_id)
                ->where('logo_id', $value)->delete();
        }

        return sendResponse(true, 'Logo removed from Logo Groups');
    }

    public function remove_logo_two(Request $request)
    {
        // return $request;

        $logos_ids = json_decode($request->logos_ids);

        if (count($logos_ids) == 0)
            return sendResponse(false, 'At least select one logo!');

        foreach ($logos_ids as $key => $value) {

            LogoFamily::where('family_id', $request->family_id)
                ->where('logo_id', $value)->delete();
        }

        return sendResponse(true, 'Logo removed from Color Families');
    }

    //THIS
    public function delete_logos(Request $request)
    {
        $logo_ids = json_decode($request->logo_ids);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;

        if ($all_check == "true") {
            parse_str($search_query, $params);

            $logo_ids = Logo::with(['families', 'groups'])
                ->when(isset($params['q']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->where('code_name', 'LIKE', '%' . $params['q'] . '%')
                            ->orWhere('color_hash', 'LIKE', '%' . $params['q'] . '%')
                            ->orWhere('tags', 'LIKE', '%' . $params['q'] . '%');
                    });
                })->when(isset($params['q2']), function ($q) use ($params) {
                    $q->whereHasIn('families', function ($q) use ($params) {
                        $q->whereIn('families.id', json_decode($params['q2']));
                    });
                })->when(isset($params['q3']), function ($q) use ($params) {
                    $q->whereHasIn('groups', function ($q) use ($params) {
                        $q->whereIn('logo_groups.id', json_decode($params['q3']));
                    });
                })->get()->pluck('id');
        }

        foreach ($logo_ids as $key => $value) {
            LogoFamily::where('logo_id', $value)->delete();
            LogoAssignedGroup::where('logo_id', $value)->delete();
            LogoGroupDetail::where('logo_id', $value)->delete();

            $logo = Logo::find($value)->delete();
        }

        return sendResponse(true, 'Logo Deleted.');
    }
}
