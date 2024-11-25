<?php

namespace App\Http\Controllers\SizeChart;

use App\Http\Controllers\Controller;
use App\Models\SizeChart\SCRule;
use App\Models\SizeChart\SCSizeChart;
use Illuminate\Http\Request;

class SizeChartController extends Controller
{
    public function getSizeCharts(Request $request)
    {
        $size_charts = SCSizeChart::when($request->has('status'), function ($q) use ($request) {
            $q->when($request->status == 0, function ($q) use ($request) {
                $q->where('status', $request->status);
            });
            $q->when($request->status == 1, function ($q) use ($request) {
                $q->where('status', $request->status);
            });
        })->when($request->get('q'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->orWhere('name', 'LIKE', '%' . $request->q . '%');
            });
        })->when($request->get('q5'), function ($q) use ($request) {
            $q->when($request->get('q5') == "id asc", function ($q) {
                $q->orderBy("id", "asc");
            });
            $q->when($request->get('q5') == "id desc", function ($q) {
                $q->orderBy("id", "desc");
            });
            $q->when($request->get('q5') == "name asc", function ($q) {
                $q->orderBy("name", "asc");
            });
            $q->when($request->get('q5') == "name desc", function ($q) {
                $q->orderBy("name", "desc");
            });
        })->cursorPaginate($request->page_count);

        return responseJson(true, 'Size charts retrieved successfully!', $size_charts);
    }

    public function saveSizeChart(Request $request)
    {
        $validator = validator($request->all(), [
            'name' => 'required',
            'chart_data' => 'required',
            'rule_id' => 'required|exists:size_chart_conn.s_c_rules,id'
        ]);
        if ($validator->fails()) {
            return sendResponse(false, $validator->errors()->first());
        }

        $size_chart = SCSizeChart::create($request->all());
        if (!$size_chart) {
            return sendResponse(false, 'An error occured while creating the size chart');
        }
        return sendResponse(true, 'Size chart created successfully!');
    }

    public function updateSizeChart(Request $request, $id)
    {
        $validator = validator($request->all(), [
            'name' => 'required',
            'chart_data' => 'required',
            'rule_id' => 'required|exists:size_chart_conn.s_c_rules,id'
        ]);
        if ($validator->fails()) {
            return sendResponse(false, $validator->errors()->first());
        }

        $size_chart = SCSizeChart::find($id);
        if (!$size_chart) {
            return sendResponse(false, 'Size chart not found!');
        }
        $updated = $size_chart->update($request->all());
        if (!$updated) {
            return sendResponse(false, 'An error occured while updating the size chart');
        }
        return sendResponse(true, 'Size chart updated successfully!');
    }

    public function setStatus(Request $request, $id)
    {
        $validator = validator($request->all(), [
            'status' => 'required',
        ]);
        if ($validator->fails()) {
            return sendResponse(false, $validator->errors()->first());
        }
        $rule = SCSizeChart::find($id);
        if (!$rule) {
            return sendResponse(false, 'Size chart not found!');
        }
        $updated = $rule->update([
            'status' => $request->status
        ]);
        if (!$updated) {
            return sendResponse(false, 'An error occured while updating the rule!');
        }
        return sendResponse(true, 'Size chart status updated successfully!', $rule);
    }


    public function delete_size_chart(Request $request)
    {
        $chart_ids = json_decode($request->chart_ids);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;

        if ($all_check == "true") {
            parse_str($search_query, $params);

            $chart_ids = SCSizeChart::when(isset($params['status']), function ($q) use ($params) {
                $q->when($params['status'] == 0, function ($q) use ($params) {
                    $q->where('status', $params['status']);
                });
                $q->when($params['status'] == 1, function ($q) use ($params) {
                    $q->where('status', $params['status']);
                });
            })->when(isset($params['q']), function ($q) use ($params) {
                $q->where(function ($q) use ($params) {
                    $q->orWhere('name', 'LIKE', '%' . $params['q'] . '%');
                });
            })->get()->pluck('id');
        }

        foreach ($chart_ids as $key => $value) {
            SCSizeChart::find($value)->delete();
        }

        return sendResponse(true, 'Size charts Deleted.');
    }
}
