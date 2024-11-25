<?php

namespace App\Http\Controllers\Filter;

use App\Http\Controllers\Controller;
use App\Models\Filter\DefaultState;
use App\Models\Filter\Filter;
use App\Models\Filter\FilterColor;
use App\Models\Filter\FilterData;
use App\Models\Filter\FilterLabel;
use App\Models\Filter\FilterSet;
use App\Models\Filter\FilterSetFilter;
use App\Models\Filter\FilterType;
use App\Models\Filter\SortType;
use App\Models\VirtualOptions\Family;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class FilterController extends Controller
{
    public function filters_list(Request $request)
    {
        $rules = Filter::with(['filter_sets', 'filter_type'])
            ->when($request->get('q'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->where('name', 'LIKE', '%' . $request->q . '%')
                        ->orWhereHas('filter_type', function ($q) use ($request) {
                            $q->where('filter_types.name', 'LIKE', '%' . $request->q . '%');
                        });
                });
            })->when($request->get('q2'), function ($q) use ($request) {
                $q->whereHasIn('filter_sets', function ($q) use ($request) {
                    $q->whereIn('filter_sets.id', json_decode($request->q2));
                });
            })->when($request->get('filter_set_id'), function ($q) use ($request) {
                $q->whereHasIn('filter_sets', function ($q) use ($request) {
                    $q->where('filter_sets.id', $request->filter_set_id);
                });
            })->when($request->get('filter_set_id_two'), function ($q) use ($request) {
                // $q->whereDoesntHaveIn('filter_sets');
                $q->whereHasIn('filter_sets', function ($q) use ($request) {
                    $q->where('filter_sets.id', $request->filter_set_id_two);
                }, '=', 0);
            })->cursorPaginate($request->page_count ? $request->page_count : 100);
        return sendResponse(true, 'Filters retrieved successfully!', $rules);
    }

    public function get_add_filter_data(Request $request)
    {
        $filter_types = FilterType::get();
        $filter_sets = FilterSet::get();
        $defaults = DefaultState::get();
        $data = FilterData::get();
        $sort_types = SortType::get();
        $families = Family::get();

        $object['data1'] =  $filter_types;
        $object['data2'] =  $data;
        $object['data3'] =  $filter_sets;
        $object['data4'] =  $defaults;
        $object['data5'] =  $sort_types;
        $object['data6'] =  $families;

        return sendResponse(true, 'Add filter required data shown', $object);
    }

    public function add_filter(Request $request)
    {
        // return $request;

        //FILTER DATA
        $filter_type = json_decode($request->filter_type);
        $filter_sets = json_decode($request->selected_filter_sets);
        $default_state = json_decode($request->default_state);
        $sort_type = json_decode($request->sort_type);
        $labels = json_decode($request->labels);
        $filter_families = json_decode($request->filter_families);
        $sorted_data = json_decode($request->sorted_data);

        if (!$filter_type)
            return sendResponse(false, "Filter Type is required.");

        //CUSTOM VALIDATIONS
        if ($filter_type->value == 1 || $filter_type->value == 2 || $filter_type->value == 4) {
            // if (count($labels) == 0)
            //     return sendResponse(false, "At least 1 Label is required.");

            foreach ($labels as $item) {
                if ($item->label == "")
                    return sendResponse(false, "Label Name is required.");
                if (count($item->labelValues) == 0)
                    return sendResponse(false, "Label Values are required.");
            }

            if ($filter_type->value == 1 && $request->prefix == "")
                return sendResponse(false, "Prefix is required.");
        } else if ($filter_type->value == 3) {
            if (count($filter_families) == 0)
                return sendResponse(false, "At least 1 family is required.");
        }

        if ($request->filter_type == "false")
            return sendResponse(false, "Filter Type is required.");

        $validator = Validator::make($request->all(), [
            'filter_name' => 'required',
            'filter_name_front' => 'required',
        ], []);

        if ($validator->fails()) return simpleValidate($validator);

        DB::beginTransaction();

        try {

            if ($request->update_filter_id != "false") {
                $new_filter = Filter::find($request->update_filter_id);

                $new_filter->labels()->each(function ($item) {
                    $item->values()->delete();
                });
                $new_filter->labels()->delete();
                $new_filter->families()->delete();
            } else $new_filter = new Filter;

            $new_filter->name = $request->filter_name;
            $new_filter->frontend_name = $request->filter_name_front;
            $new_filter->filter_type_id = $filter_type->value;
            $new_filter->default_state_id = $default_state->value;
            $new_filter->multi_select = ($request->multi_select === 'true');
            $new_filter->sort_type_id = $sort_type->value;
            $new_filter->show_swatches = ($request->show_swatches === 'true');
            $new_filter->prefix = $request->prefix;
            $new_filter->save();

            if ($filter_type->value == 1 || $filter_type->value == 2 || $filter_type->value == 4) {

                foreach ($labels as $item) {

                    $filter_label = $new_filter->labels()->create([
                        'label' => $item->label,
                    ]);

                    foreach ($item->labelValues as $value) {
                        $filter_label->values()->create([
                            'filter_data_id' => $value->value,
                        ]);
                    }
                }

                if ($sort_type->value == 3) {
                    foreach ($sorted_data as $key => $sorted) {
                        $sort_filter_label = FilterLabel::where('filter_id', $new_filter->id)->where('label', $sorted->option)->first();
                        $sort_filter_label->update([
                            'sort_number' => $key + 1,
                        ]);
                    }
                }
            } else if ($filter_type->value == 3) {

                foreach ($filter_families as $item) {

                    $new_filter->families()->create([
                        'family_id' => $item->value,
                    ]);
                }

                if ($sort_type->value == 3) {
                    foreach ($sorted_data as $key => $sorted) {
                        $sort_filter_label = FilterColor::where('filter_id', $new_filter->id)->where('family_id', $sorted->id)->first();
                        $sort_filter_label->update([
                            'sort_number' => $key + 1,
                        ]);
                    }
                }
            }

            $filter_set_ids = collect($filter_sets)->pluck('value');
            $new_filter->filter_sets()->sync($filter_set_ids);

            DB::commit();

            $message = "";
            if ($request->update_filter_id != "false")
                $message = "Updated.";
            else
                $message = "Added.";

            //
            return sendResponse(true, "Filter '$filter_type->label' $message");
            //
        } catch (\Throwable $th) {
            return $th;
        }
    }

    public function get_filter_editing_data(Request $request)
    {
        $filter = Filter::find($request->filter_id)->load(['filter_type', 'filter_sets', 'sort_type', 'default_state', 'labels.values.filter_data', 'families.family']);
        return sendResponse(true, 'Get editing filter data',  $filter);
    }

    public function assign_filter_filter_sets(Request $request)
    {
        $filter_set_ids = json_decode($request->filter_set_ids);
        $filter_ids = json_decode($request->filter_ids);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;

        if ($all_check == "true") {
            parse_str($search_query, $params);

            $filter_ids = Filter::with(['filter_sets', 'filter_type'])
                ->when(isset($params['q']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->where('name', 'LIKE', '%' . $params['q'] . '%');
                    });
                })->when(isset($params['q2']), function ($q) use ($params) {
                    $q->whereHasIn('filter_sets', function ($q) use ($params) {
                        $q->whereIn('filter_sets.id', json_decode($params['q2']));
                    });
                })->get()->pluck('id');
        }

        DB::beginTransaction();
        try {

            foreach ($filter_ids as $key => $filter) {
                $inside_filter = Filter::find($filter);
                $inside_filter->filter_sets()->sync($filter_set_ids);
            }

            DB::commit();

            return sendResponse(true,  'Filter sets assigned to filter.');
            //
        } catch (\Exception $th) {
            return $th;
        }
    }

    public function remove_filter(Request $request)
    {
        // return $request;

        $filters_ids = json_decode($request->filters_ids);

        if (count($filters_ids) == 0)
            return sendResponse(false, 'At least select one logo!');

        foreach ($filters_ids as $key => $value) {

            FilterSetFilter::where('filter_set_id', $request->filter_set_id)->where('filter_id', $value)->delete();
        }

        return sendResponse(true, 'Filter removed from Filter Set');
    }

    public function assign_filter_specific(Request $request)
    {
        // return $request;

        $filters_ids = json_decode($request->filters_ids);

        if (count($filters_ids) == 0)
            return sendResponse(false, 'At least select one filter!');

        foreach ($filters_ids as $key => $value) {

            $check = FilterSetFilter::where('filter_id', $value)->where('filter_set_id', $request->filter_set_id)->first();

            if (empty($check)) {
                $new_filter = new FilterSetFilter;
                $new_filter->filter_id = $value;
                $new_filter->filter_set_id = $request->filter_set_id;
                $new_filter->save();
            }
        }

        return sendResponse(true, 'Filter Assigned to Filter Set');
    }

    public function delete_filter_set(Request $request)
    {
        $filter_set = FilterSet::find($request->editing_id);
        $filter_set->delete();

        return sendResponse(true, 'Filter Set deleted and Its assigned filters are Unassigned');
    }

    public function delete_selected_filters(Request $request)
    {
        // return $request;

        $filter_ids = json_decode($request->filter_ids);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;

        if ($all_check == "true") {
            parse_str($search_query, $params);

            $filter_ids = Filter::with(['filter_sets', 'filter_type'])
                ->when(isset($params['q']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->where('name', 'LIKE', '%' . $params['q'] . '%');
                    });
                })->when(isset($params['q2']), function ($q) use ($params) {
                    $q->whereHasIn('filter_sets', function ($q) use ($params) {
                        $q->whereIn('filter_sets.id', json_decode($params['q2']));
                    });
                })->get()->pluck('id');
        }

        if (count($filter_ids) == 0)
            return sendResponse(false, 'At least select one filter!');

        foreach ($filter_ids as $key => $value) {
            $filter = Filter::find($value);
            $filter->labels()->each(function ($item) {
                $item->values()->delete();
            });
            $filter->labels()->delete();
            $filter->families()->delete();
            $filter->delete();
            FilterSetFilter::where('filter_id', $value)->delete();
        }

        return sendResponse(true, "Selected Filter's are removed.");
    }

    public function filters_list_sort(Request $request)
    {
        $filters = FilterSetFilter::with(['filter_sort.filter_type'])
            ->when($request->get('filter_set_id'), function ($q) use ($request) {
                $q->where('filter_set_id', $request->filter_set_id);
            })->orderBy('sort_number', 'asc')->get();
        return sendResponse(true, 'Filters retrieved successfully!', $filters);
    }

    public function manage_new_sort_filters(Request $request)
    {
        $rows = json_decode($request->rows);
        $ids = collect($rows)->pluck('id');

        foreach ($ids as $key => $value) {

            $assigned = FilterSetFilter::find($value);
            $assigned->sort_number = $key + 1;
            $assigned->save();
        }

        return sendResponse(true, 'Sort Updated Successfully');
    }
}
