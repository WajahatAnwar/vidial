<?php

namespace App\Http\Controllers\PurchaseOrder;

use App\Exports\PurchaseOrder\CSVRecordExport;
use App\Http\Controllers\Controller;
use App\Imports\PurchaseOrder\CSVRecordImport;
use App\Models\AllInOne\User;
use App\Models\PurchaseOrder\POCSVRecord;
use App\Models\PurchaseOrder\POSetting;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use stdClass;

class ButtonController extends Controller
{
    public function get_button_settings()
    {
        $records = POCSVRecord::get();

        return response()->json([
            'success' => true,
            'message' => 'Button settings shown',
            'data3' => count($records)
        ]);
    }

    public function set_button_settings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'discount_field_placeholder' => 'required|string',
            'po_field_placeholder' => 'required|string',
        ], [
            // 'city.required' => "State field is required",
        ]);
        if ($validator->fails()) {
            $error = $validator->errors()->toArray();
            foreach ($error as $x => $x_value) {
                $err[] = $x_value[0];
            }

            return response()->json([
                'success' => false,
                'message' => $err['0'],
            ]);
        } else {

            $buttonData = [
                'button_text' =>  $request->button_text,
                'icon_string' => $request->button_icon,
                'button_placement' => $request->button_placement,
                'font_color' => $request->font_color,
                'background_color' => $request->button_color,
                'po_field_placeholder' => $request->po_field_placeholder,
                'discount_field_placeholder' => $request->discount_field_placeholder,
            ];

            POSetting::updateOrCreate(['user_id' => $request->user_id], $buttonData);

            return response()->json([
                'success' => true,
                'message' => 'Button settings updated',
            ]);
        }
    }

    public function change_order_status(Request $request)
    {
        $user = User::find($request->user_id);
        $user->direct_approve = ($request->direct_approve === 'true');
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Direct approve status updated',
        ]);
    }

    public function import_csv(Request $request)
    {
        POCSVRecord::query()->delete();

        try {
            Excel::import(new CSVRecordImport, $request->file('csv_file'));
        } catch (\Exception $th) {
            $str['status'] = false;
            $str['message'] = "CSV not added successfully. Invalid data for rows.";
            $str['data'] =  $th;
            return $str;
        }

        $records = POCSVRecord::get();

        $str['status'] = true;
        $str['message'] = "CSV ADDED";
        $str['data'] = count($records);
        return $str;
    }

    public function export_csv()
    {
        return Excel::download(new CSVRecordExport, 'mins.csv');
    }

    public function remove_csv()
    {
        POCSVRecord::query()->delete();

        $str['status'] = true;
        $str['message'] = "CSV REMOVED";
        return $str;
    }
}
