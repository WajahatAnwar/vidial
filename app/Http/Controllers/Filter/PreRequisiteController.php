<?php

namespace App\Http\Controllers\Filter;

use App\Http\Controllers\Controller;
use App\Models\AllInOne\Product;
use App\Models\Filter\FilterData;
use App\Models\InConnect\ShopifySize;
use Illuminate\Http\Request;

class PreRequisiteController extends Controller
{
    public function preRequisite()
    {
        $types = Product::select('product_type')->groupBy('product_type')->get();
        foreach ($types as $key => $value) {
            FilterData::updateorCreate(['type' => "product_type", 'name' => trim($value->product_type)]);
        }

        $product_tags = Product::select('product_tags')->groupBy('product_tags')->get();
        foreach ($product_tags as $key => $value) {
            $tags = explode(',', $value->product_tags);
            foreach ($tags as $key2 => $value2) {
                FilterData::updateorCreate(['type' => "product_tag", 'name' => trim($value2)]);
            }
        }

        $sizes = ShopifySize::get();
        foreach ($sizes as $key => $value) {
            FilterData::updateorCreate(['type' => "product_size", 'name' => $value->name]);
        }

        return sendResponse(true, 'Pre-requisite data fetched successfully');
    }
}
