<?php

namespace App\Http\Controllers\SizeChart;

use App\Http\Controllers\Controller;
use App\Models\SizeChart\SCRule;
use App\Models\SizeChart\SCSizeChart;
use Illuminate\Http\Request;

class RuleController extends Controller
{
    public function saveRule(Request $request)
    {
        $validator = validator($request->all(), [
            'name' => 'required',
            'data' => 'required|array',
            'data.*.qualifier' => 'required',
            'data.*.condition' => 'required',
            'data.*.value' => 'required',
            'data.*.andOr' => 'required',
        ], [
            'data.*.qualifier.required' => 'The rule :position qualifier field is required',
            'data.*.condition.required' => 'The rule :position condition field is required',
            'data.*.value.required' => 'The rule :position value field is required',
            'data.*.andOr.required' => 'The rule :position andOr field is required'
        ]);
        if ($validator->fails()) {
            return sendResponse(false, $validator->errors()->first());
        }

        $rule = SCRule::create([
            'name' => $request->name,
            'data' => $request->data,
        ]);
        if (!$rule) {
            return sendResponse(false, 'An error occured while creating the rule');
        }
        return sendResponse(true, 'Rule created successfully!');
    }

    public function getRules(Request $request)
    {
        $rules = SCRule::when($request->has('status'), function ($q) use ($request) {
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

        return responseJson(true, 'Rules retrieved successfully!', $rules);
    }

    public function getRule($id)
    {
        $rule = SCRule::find($id);
        if (!$rule) {
            return sendResponse(false, 'Rule not found!');
        }
        return sendResponse(true, 'Rule retrieved successfully!', $rule);
    }

    public function updateRule(Request $request, $id)
    {
        $validator = validator($request->all(), [
            'name' => 'required',
            'data' => 'required|array',
            'data.*.qualifier' => 'required',
            'data.*.condition' => 'required',
            'data.*.value' => 'required',
            'data.*.andOr' => 'required',
        ], [
            'data.*.qualifier.required' => 'The rule :position qualifier field is required',
            'data.*.condition.required' => 'The rule :position condition field is required',
            'data.*.value.required' => 'The rule :position value field is required',
            'data.*.andOr.required' => 'The rule :position andOr field is required'
        ]);
        if ($validator->fails()) {
            return sendResponse(false, $validator->errors()->first());
        }
        $rule = SCRule::find($id);
        if (!$rule) {
            return sendResponse(false, 'Rule not found!');
        }
        $updated = $rule->update($request->all());
        if (!$updated) {
            return sendResponse(false, 'An error occured while updating the rule');
        }
        return sendResponse(true, 'Rule updated successfully!', $rule);
    }

    public function getAllRules()
    {
        $rules = SCRule::lazy();
        return sendResponse(true, 'Rules retrieved successfully!', $rules);
    }

    public function setStatus(Request $request, $id)
    {
        $validator = validator($request->all(), [
            'status' => 'required',
        ]);
        if ($validator->fails()) {
            return sendResponse(false, $validator->errors()->first());
        }
        $rule = SCRule::find($id);
        if (!$rule) {
            return sendResponse(false, 'Rule not found!');
        }
        $updated = $rule->update([
            'status' => $request->status
        ]);
        if (!$updated) {
            return sendResponse(false, 'An error occured while updating the rule!');
        }
        return sendResponse(true, 'Rule status updated successfully!', $rule);
    }

    private function getCondition($input, $condition, $value)
    {
        if ($condition == 'equal') {
            return $input == $value;
        } elseif ($condition == 'begins_with') {
            return str_starts_with($input, $value);
        } elseif ($condition == 'contains') {
            return str_contains($input, $value);
        }
    }

    public function applyRule(Request $request)
    {
        $rules = SCRule::where('status', 1)->lazy();
        $appliedRule = null;
        foreach ($rules as $rule) {
            $appliedCondition = false;
            $prevCondition = '';
            $prevApplied = false;
            foreach ($rule->data as $index => $condition) {
                if ($condition->qualifier == 'tag') {
                    $tags = explode(',', $request->tags);
                    foreach ($tags as $tag) {
                        $current = $this->getCondition(strtolower($tag), $condition->condition, strtolower($condition->value));
                        $appliedCondition = (($prevCondition == 'and' ? ($prevApplied && $current) : $prevCondition == 'or') ? ($prevApplied || $current) : $index == 0 && $current) ? true : false;
                        if ($appliedCondition) break;
                    }
                } else if ($condition->qualifier == 'product_name') {
                    $current = $this->getCondition(strtolower($request->product_name), $condition->condition, strtolower($condition->value));
                    $appliedCondition = (($prevCondition == 'and' ? ($prevApplied && $current) : $prevCondition == 'or') ? ($prevApplied || $current) : $index == 0 && $current) ? true : false;
                } else if ($condition->qualifier == 'handle') {
                    $current = $this->getCondition(strtolower($request->handle), $condition->condition, strtolower($condition->value));
                    $appliedCondition = (($prevCondition == 'and' ? ($prevApplied && $current) : $prevCondition == 'or') ? ($prevApplied || $current) : $index == 0 && $current) ? true : false;
                }
                $prevApplied = $appliedCondition;
                $prevCondition = $condition->andOr;
            }
            if ($appliedCondition) {
                $appliedRule = $rule;
                break;
            }
        }
        if (!$appliedRule) {
            return sendResponse(false, 'No rule found!', $appliedRule);
        }
        $appliedRule = $appliedRule->load(['size_chart' => function ($q) {
            $q->where('s_c_size_charts.status', 1);
        }]);
        if (!$appliedRule->size_chart) {
            return sendResponse(false, 'No Size Chart found!', $appliedRule);
        }
        return sendResponse(true, 'Rule applied successfully!', $appliedRule->load('size_chart'));
    }


    public function delete_rule(Request $request)
    {
        $rule_ids = json_decode($request->rule_ids);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;

        if ($all_check == "true") {
            parse_str($search_query, $params);

            $rule_ids = SCRule::when(isset($params['status']), function ($q) use ($params) {
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

        foreach ($rule_ids as $key => $value) {
            SCSizeChart::where('rule_id', $value)->delete();
            SCRule::find($value)->delete();
        }

        return sendResponse(true, 'Rules and its corresponding charts Deleted.');
    }
}
