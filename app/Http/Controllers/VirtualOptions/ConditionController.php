<?php

namespace App\Http\Controllers\VirtualOptions;
use App\Http\Controllers\Controller;

use App\Models\VirtualOptions\DropdownDetail;
use App\Models\VirtualOptions\LogoGroupDetail;
use App\Models\VirtualOptions\Option;
use App\Models\VirtualOptions\TextareaDetail;
use Illuminate\Http\Request;

class ConditionController extends Controller
{
    public function get_regarding_options(Request $request)
    {
        // return $request;
        $options = Option::where('option_type_id', $request->option_type_id)->get();
        return sendResponse(true, "Regarding Options Shown", $options);
    }

    public function get_regarding_option_data(Request $request)
    {
        $dropdown_options = DropdownDetail::where('option_id', $request->option_id)->get();
        $logo_group_options = LogoGroupDetail::with('logo')->where('option_id', $request->option_id)->get();
        $textarea_option = TextareaDetail::where('option_id', $request->option_id)->first();

        $object['dropdown'] = $dropdown_options;
        $object['logo_group'] = $logo_group_options;
        $object['text_area'] = $textarea_option;

        return sendResponse(true, "Regarding Option Options Shown", $object);
    }
}
