<?php

namespace App\Http\Controllers\InConnect;

use App\Http\Controllers\Controller;
use App\Models\AllInOne\Product;
use App\Models\InConnect\DecoratorData;
use App\Models\InConnect\IntactVendor;
use App\Models\InConnect\ShopifyLocationField;
use App\Models\InConnect\ShopifyVendor;
use App\Models\VirtualOptions\Option;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class PrerequisiteController extends Controller
{
    public function preRequisite()
    {
        // DecoratorData::where('type', 'admin_note')->delete();
        // ->where('frontend_name', 'LIKE', '%decoration%')
        $admin_note = Option::with('note_detail')->where('option_type_id', 5)->get();

        foreach ($admin_note as $key => $value) {
            $note_detail_value = strip_tags(($value->note_detail->value));
            DecoratorData::updateorCreate(['type' => "admin_note", 'name' => $note_detail_value]);
        }

        foreach ($admin_note as $key => $value) {
            DecoratorData::updateorCreate(['type' => "decoration", 'name' => $value->frontend_name]);
        }

        // DecoratorData::where('type', 'dropdown')->delete();
        // ->where('frontend_name', 'LIKE', '%logo location%')
        $dropdown = Option::with('drop_detail')->where('option_type_id', 1)->get();
        foreach ($dropdown as $key => $value) {
            foreach ($value->drop_detail as $key2 => $value2) {
                DecoratorData::updateorCreate(['type' => "dropdown", 'name' => $value2->value]);
            }
        }

        // DecoratorData::where('type', 'logo_location')->delete();
        $dropdown = Option::where('option_type_id', 1)->get();
        foreach ($dropdown as $key => $value) {
            DecoratorData::updateorCreate(['type' => "logo_location", 'name' => $value->frontend_name]);
        }

        // DecoratorData::where('type', 'logo_group')->delete();
        $logo_group = Option::where('option_type_id', 2)->get();
        foreach ($logo_group as $key => $value) {
            DecoratorData::updateorCreate(['type' => "logo_group", 'name' => $value->frontend_name]);
        }

        // DecoratorData::where('type', 'personalization_input')->delete();
        $input_field_thread = Option::with('input_detail')->where('option_type_id', 6)->get();
        foreach ($input_field_thread as $key => $value) {
            $line_count = count($value->input_detail);
            // Log::info($line_count);

            $data = DecoratorData::updateorCreate(
                [
                    'type' => "personalization_input",
                    'name' => $value->frontend_name
                ],
            );

            if ($line_count > $data->count) {
                $data->update(['count' => $line_count]);
            }
        }

        // ShopifyVendor::query()->delete();
        $vendors = Product::select('product_vendor')
        ->groupByRaw('BINARY `product_vendor`')
        ->get();
        foreach ($vendors as $key => $value) {
            // logger(json_encode($value));
            ShopifyVendor::updateOrCreate(
                ['name' => DB::raw('BINARY "' . $value->product_vendor . '"')], 
                ['name' => $value->product_vendor]
            );
        }

        return sendResponse(true, 'Pre-requisite data fetched successfully');
    }
}
