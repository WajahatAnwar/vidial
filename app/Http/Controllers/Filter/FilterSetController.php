<?php

namespace App\Http\Controllers\Filter;

use App\Http\Controllers\Controller;
use App\Models\Filter\FilterSet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FilterSetController extends Controller
{
    public function filter_sets_list()
    {
        $filter_sets = FilterSet::orderBy('name', 'asc')->get();
        return sendResponse(true, 'Filters sets recieved', $filter_sets);
    }

    public function add_filter_set(Request $request)
    {
        $validator = Validator::make($request->all(), ['name' => 'required'], []);

        if ($validator->fails()) return simpleValidate($validator);

        $new_option_set = new FilterSet;
        $new_option_set->name = $request->name;
        $new_option_set->save();

        return sendResponse(true, 'New Filter Set Added.');
    }

    public function get_filter_set_editing_data(Request $request)
    {
        $option_set = FilterSet::find($request->editing_id);
        return sendResponse(true, 'Filter Set data shown',  $option_set);
    }

    public function update_filter_set_name(Request $request)
    {
        if (!isset($request->name))
            return sendResponse(false, 'The name field is required.');

        $update_option_set = FilterSet::find($request->editing_id);
        $update_option_set->name = $request->name;
        $update_option_set->save();

        return sendResponse(true, 'Filter Set name Updated.');
    }

    public function filter_sets_table(Request $request)
    {
        $rules = FilterSet::when($request->get('q'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->where('name', 'LIKE', '%' . $request->q . '%');
            });
        })->cursorPaginate(5);
        return sendResponse(true, 'Filter Set retrieved successfully!', $rules);
    }
}
