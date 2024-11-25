<?php

namespace App\Http\Controllers\InConnect;

use App\Http\Controllers\Controller;
use App\Models\InConnect\GooselyRule;
use Illuminate\Http\Request;

class RuleController extends Controller
{
    public function rulesList(Request $request)
    {
        $rules = GooselyRule::when($request->get('q'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->orWhere('name', 'LIKE', '%' . $request->q . '%');
                $q->orWhere('po_prefix', 'LIKE', '%' . $request->q . '%');
                $q->orWhere('intact_vendor_id', 'LIKE', '%' . $request->q . '%');
            });
        })->with(['product_type'])->paginate($request->page_count);
        return responseJson(true, 'Rules retrieved successfully!', $rules);
    }

    public function store(Request $request)
    {
        if (!$request->productType)
            return sendResponse(false, 'Product Type is required!', null);

        $rule = GooselyRule::create([
            'product_type_id' => $request->productType,
            'shopifyOrder' => $request->shopifyOrder,
            'intacctOrder' => $request->intacctOrder,
        ]);

        return responseJson(true, 'GooselyRule created successfully!', null);
    }

    public function update(Request $request)
    {
        if (!$request->productType)
            return sendResponse(false, 'Product Type is required!', null);

        $rule = GooselyRule::find($request->editingId);

        $rule->update([
            'product_type_id' => $request->productType,
            'shopifyOrder' => $request->shopifyOrder,
            'intacctOrder' => $request->intacctOrder,
        ]);

        return responseJson(true, 'GooselyRule updated successfully!', null);
    }

    public function destroy(Request $request)
    {
        $rule = GooselyRule::find($request->deletingId)->delete();

        return responseJson(true, 'Goosely Rule deleted successfully!', null);
    }
}
