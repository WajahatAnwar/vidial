<?php

namespace App\Http\Controllers\Maven;

use App\Http\Controllers\Controller;
use App\Jobs\InConnect\IntacctSalesOrderJob;
use App\Models\Maven\MavenCall;
use App\Models\Maven\GooselyPurchaseOrder;
use App\Models\Maven\MavenLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Traits\InConnect\IntacctTrait;
use Illuminate\Support\Str;
use Inertia\Inertia;

class GooselyApiController extends Controller
{
    use IntacctTrait;

    private function saveApiCall($name, $payload, $response, $status) {
        $maven_call = new MavenCall();
        $maven_call->name = $name;
        $maven_call->payload = $payload;
        $maven_call->response = $response;
        $maven_call->status = $status;
        $maven_call->save();
    }

    private function generateItems($object) {
        // JUST CHECK ITEMS. IF NOT CREATED ALREADY THEN CREATE IT
        foreach ($object['line_items'] as $key => $item) {
            $response = $this->getItemByID($this->replace_ampersand($item['item_id']));
            if(isset($response['operation']) && !$response['operation']['result']['data']['@attributes']['count'] > 0) {

                if(!isset($item['title']) || isset($item['title']) == "") {
                    return [
                        "success" => false,
                        "message" => "For Intacct product create property 'title' is required for item_id: " . $item['item_id']
                    ];
                }

                if(!isset($item['description']) || isset($item['description']) == "") {
                    return [
                        "success" => false,
                        "message" => "For Intacct product create property 'description' is required for item_id: " . $item['item_id']
                    ];
                }

                $creation_response = $this->createItem([
                    // 'vendor_name' => $item['vendor'],
                    'title' => $item['title'],
                    'item_id' => $item['item_id'],
                    'price' => $item['price'],
                    'shipping_weight' => 0.00,
                    'brand' => '',
                    'subbrand' => '',
                    'category' => '',
                    'subcategory' => '',
                    'size1' => '',
                    'style' => '',
                    'color' => '',
                    'description' => $item['description'],
                ], "maven");

                if($creation_response['operation']['result']['status'] == "failure") {
                    return [
                        "success" => false,
                        "message" => "Intacct Product not created due to following error!",
                        "data" => $creation_response
                    ];
                } else if($creation_response['operation']['result']['status'] == "success") {
                    // logger("SOLO INTACCT ITEM CREATED HAVING ITEM ID: " . $creation_response['operation']['result']['data']['item']['ITEMID']);
                }

            } else {
                if(!isset($response['operation'])) {
                    return [
                        "success" => false,
                        "message" => "Intacct Product not created due to following error!",
                        "data" => $creation_response
                    ];
                }
            }
        }

        return [
            "success" => true,
            "message" => "All good to go",
        ];
    }

    private function generatingVendor(&$object) {

        if(!isset($object['vendor_id']) || $object['vendor_id'] == "") {
            $validator_two = Validator::make($object, [
                'vendor.name' => 'required|string',
            ], []);

            if ($validator_two->fails()) {
                $error = $validator_two->errors()->first();
                return [
                    'success' => false,
                    'message' => $error,
                ];
            }

            $new_vendor = $this->createVendor($this->replace_ampersand($object['vendor']['name']));
            if($new_vendor['operation']['result']['status'] == "failure") {
                return [
                    "success" => false,
                    "message" => "Vendor not created due to following error!",
                    "data" => $new_vendor
                ];
            } else if($new_vendor['operation']['result']['status'] == "success") {
                // logger("SOLO INTACCT VENDOR CREATED HAVING VENDOR ID: " . json_encode($new_vendor));
                $object['vendor_id'] = $new_vendor['operation']['result']['key'];

                $new_vendor = [
                    'status' => "success",
                    "message" => "New Vendor Created. Use this 'vendor_id' next time.",
                    "vendor_id" => $new_vendor['operation']['result']['key']
                ];
            }
        } else {

            //CHECK IF A COMPANY EXIST ALREADY
            $vendor = $this->getDataByQuery("VENDORID LIKE '%{$this->replace_ampersand($object['vendor_id'])}%'", "VENDOR");
            if(!$vendor['operation']['result']['data']['@attributes']['count'] > 0) {
                return [
                    "success" => false,
                    "message" => "Vendor does not exist on Intacct!",
                    "data" => $vendor
                ];
            } else {
                // logger("SOLO INTACCT VENDOR ALREADY AVAIBLABLE HAVING VENDOR ID: " . json_encode($vendor['operation']['result']['data']['vendor']['VENDORID']));
                $object['vendor_id'] = $vendor['operation']['result']['data']['vendor']['VENDORID'];
            }
        }

        $final["success"] = true;
        $final["message"] = "All good to go";
        if(isset($new_vendor))
            $final["vendor"] = @$new_vendor;
        return $final;
    }

    public function createSalesInvoice(Request $request)
    {
        // return Auth::user();
        // return $request->all();
        // return $request;
        // return $request->user();

        $validator = Validator::make($request->all(), [
            'line_items' => 'required|array|min:1',
            'line_items.*.item_id' => 'required|string',
            'line_items.*.quantity' => 'required|integer',
            // 'line_items.*.price' => 'required|numeric|min:0',
            'line_items.*.location_id' => 'required|string',
            'line_items.*.department_id' => 'required|string',
            'line_items.*.class_id' => 'required|string',
            'line_items.*.employee_id' => 'required|string',
            'shipping_address.address1' => 'required|string',
            'shipping_address.address2' => 'nullable|string',
            'shipping_address.city' => 'required|string',
            'shipping_address.zip' => 'required|string',
            'shipping_address.province' => 'required|string',
            'shipping_address.country' => 'required|string',
            'shipping_address.name' => 'required|string',
            'shipping_address.email' => 'required|email',
            'shipping_address.country_code' => 'required|string',
            'billing_address.address1' => 'required|string',
            'billing_address.address2' => 'nullable|string',
            'billing_address.city' => 'required|string',
            'billing_address.zip' => 'required|string',
            'billing_address.province' => 'required|string',
            'billing_address.country' => 'required|string',
            'billing_address.name' => 'required|string',
            'billing_address.email' => 'required|email',
            'billing_address.country_code' => 'required|string',
            'currency' => 'required|string',
            'reference_no' => 'required|string',
            // 'due_date' => 'required|date',
            'message' => 'required|string',
            'term_name' => 'required|string',
            'document_no' => 'required|string',
            'customer_po' => 'required|string',
            'customer_id' => 'nullable|string',
            'shipping_method' => 'required|string',
            'intact_so_number' => 'nullable|string',
        ], []);

        if ($validator->fails()) return simpleValidate($validator);

        $object = $request->all();
        $object['total_tax'] = "0.00";
        $object['tax_lines'] = [];
        $object['shipping_lines'] = [];

        if(!isset($object['customer_id']) || $object['customer_id'] == "") {
            $validator_two = Validator::make($request->all(), [
                'organization.name' => 'required|string',
                'organization.type' => 'required|string',
                'organization.sub_type' => 'required|string',
                'organization.address1' => 'required|string',
                'organization.address2' => 'nullable|string',
                'organization.city' => 'required|string',
                'organization.province' => 'required|string',
                'organization.zip' => 'required|string',
                'organization.country' => 'required|string',
                // 'organization.email' => 'required|email',
                'organization.country_code' => 'required|string',
            ], []);

            if ($validator_two->fails()) return simpleValidate($validator_two);

            $new_organization = $this->createCompany($object['organization']);
            if($new_organization['operation']['result']['status'] == "failure") {
                return sendResponse(false,"Sales Invoice not created due to following error! first_errors", $new_organization);
            } else if($new_organization['operation']['result']['status'] == "success") {
                // logger("SOLO INTACCT CUSTOMER CREATED HAVING CUSTOMER ID: " . json_encode($new_organization['operation']['result']['data']['customer']));
                $object['company_id'] = $new_organization['operation']['result']['data']['customer']['CUSTOMERID'];
                $object['company_name'] = $object['organization']['name'];
                $object['customer_id'] = $new_organization['operation']['result']['data']['customer']['CUSTOMERID'];

                $new_organization = [
                    'status' => "success",
                    "message" => "New Customer Created. Use this 'customer_id' next time.",
                    "customer_id" => $new_organization['operation']['result']['data']['customer']['CUSTOMERID']
                ];
            }
        } else {

            //CHECK IF A COMPANY EXIST ALREADY
            $company = $this->getDataByQuery("CUSTOMERID LIKE '%{$this->replace_ampersand($object['customer_id'])}%'", "CUSTOMER");
            if(!$company['operation']['result']['data']['@attributes']['count'] > 0) {
                return sendResponse(false, "Customer (Company) Does not exist on Intacct!", $company);
            } else {
                // logger("SOLO INTACCT CUSTOMER ALREADY AVAIBLABLE HAVING CUSTOMER ID: " . json_encode($company['operation']['result']['data']['customer']));
                $object['company_id'] = $company['operation']['result']['data']['customer']['CUSTOMERID'];
                $object['company_name'] = $company['operation']['result']['data']['customer']['NAME'];
                $object['customer_id'] = $company['operation']['result']['data']['customer']['CUSTOMERID'];
            }
        }

        //GENERATING ITEMS ON INTACCT
        $major_response = $this->generateItems($object);
        if(!$major_response['success'])
            return $major_response;

        $invoice = $this->createSalesOrder(null, $object, "Sales Invoice", "maven", "normal", false, false);
        // logger(json_encode($invoice, JSON_PRETTY_PRINT));

        $generalStatus = $invoice['operation']['result']['status'] ?? "failure";

        if($invoice['operation']['result']['status'] == "failure") {
            $invoice = [
                'status' => "failure",
                "message" => "Sales Invoice not created due to following error",
                "error" => $invoice
            ];
        } else if($invoice['operation']['result']['status'] == "success") {
            $invoice = [
              'status' => "success",
              "message" => "Sales Invoice Created Successfully having key: '" . $invoice['operation']['result']['key'] . "'"
            ];
        }

        $final_response["success"] = $generalStatus;
        $final_response["message"] = "API Response is as follows:";
        $final_response["sales_invoice"] = @$invoice;
        if(isset($new_organization))
            $final_response["customer"] = @$new_organization;

        $this->saveApiCall("createSalesInvoice", json_encode($object), json_encode($final_response), $generalStatus);
        return response()->json($final_response);
    }

    public function createPurchaseCost(Request $request) {

        $validator = Validator::make($request->all(), [
            'line_items' => 'required|array|min:1',
            'line_items.*.item_id' => 'required|string',
            'line_items.*.quantity' => 'required|integer',
            // 'line_items.*.price' => 'required|numeric|min:0',
            'line_items.*.location_id' => 'required|string',
            'line_items.*.department_id' => 'required|string',
            'line_items.*.class_id' => 'required|string',
            'line_items.*.employee_id' => 'required|string',
            'reference_no' => 'required|string',
            // 'due_date' => 'required|date',
            'message' => 'required|string',
            'term_name' => 'required|string',
            'document_no' => 'required|string',
            'shipping_method' => 'required|string',
            'vendor_id' => 'nullable|string',
        ], []);

        if ($validator->fails()) return simpleValidate($validator);

        $object = $request->all();

        $vendor_response = $this->generatingVendor($object);
        if(!$vendor_response['success'])
            return $vendor_response;

        //GENERATING ITEMS ON INTACCT
        $major_response = $this->generateItems($object);
        if(!$major_response['success'])
            return $major_response;

        $purchase_cost = $this->createPurchaseOrder($object, 'Purchase Cost');
        // logger(json_encode($purchase_cost));

        $generalStatus = $purchase_cost['operation']['result']['status'] ?? "failure";

        if($purchase_cost['operation']['result']['status'] == "failure") {
            $purchase_cost = [
                'status' => "failure",
                "message" => "Purchase Cost not created due to following error",
                "error" => $purchase_cost
            ];
        } else if($purchase_cost['operation']['result']['status'] == "success") {
            $purchase_cost = [
            'status' => "success",
            "message" => "Purchase Cost Created Successfully having key: '" . $purchase_cost['operation']['result']['key'] . "'"
            ];
        }

        $final_response["success"] = $generalStatus;
        $final_response["message"] = "API Response is as follows:";
        $final_response["purchase_cost"] = @$purchase_cost;
        if(isset($vendor_response['vendor']))
            $final_response["vendor"] = @$vendor_response['vendor'];

        $this->saveApiCall("createPurchaseCost", json_encode($object), json_encode($final_response), $generalStatus);
        return response()->json($final_response);
    }

    public function createVendorInvoice(Request $request)
    {
        $validator = Validator::make($request->all(), [
            // 'due_date' => 'required|date',
            'vendor_id' => 'nullable|string',
            'reference_no' => 'required|string',
            'document_no' => 'required|string',
            'message' => 'required|string',
            'shipping_method' => 'required|string',
            'term_name' => 'required|string',
            'intact_po_number' => 'nullable|string',
            'line_items' => 'required|array|min:1',
            'line_items.*.item_id' => 'required|string',
            'line_items.*.quantity' => 'required|integer',
            // 'line_items.*.price' => 'required|numeric|min:0',
            'line_items.*.location_id' => 'required|string',
            'line_items.*.department_id' => 'required|string',
            'line_items.*.class_id' => 'required|string',
            'line_items.*.employee_id' => 'required|string',
        ], []);

        if ($validator->fails()) return simpleValidate($validator);

        $object = $request->all();

        $vendor_response = $this->generatingVendor($object);
        if(!$vendor_response['success'])
            return $vendor_response;

        //GENERATING ITEMS ON INTACCT
        $major_response = $this->generateItems($object);
        if(!$major_response['success'])
            return $major_response;

        $vendor_invoice = $this->createPurchaseOrder($object, 'Vendor Invoice');
        // logger(json_encode($vendor_invoice, JSON_PRETTY_PRINT));

        $generalStatus = $vendor_invoice['operation']['result']['status'] ?? "failure";

        if($vendor_invoice['operation']['result']['status'] == "failure") {
            $vendor_invoice = [
                'status' => "failure",
                "message" => "Vendor Invoice not created due to following error",
                "error" => $vendor_invoice
            ];
        } else if($vendor_invoice['operation']['result']['status'] == "success") {
            $vendor_invoice = [
            'status' => "success",
            "message" => "Vendor Invoice Created Successfully having key: '" . $vendor_invoice['operation']['result']['key'] . "'"
            ];
        }

        $final_response["success"] = $generalStatus;
        $final_response["message"] = "API Response is as follows:";
        $final_response["vendor_invoice"] = @$vendor_invoice;
        if(isset($vendor_response['vendor']))
            $final_response["vendor"] = @$vendor_response['vendor'];

        $this->saveApiCall("createVendorInvoice", json_encode($object), json_encode($final_response), $generalStatus);
        return response()->json($final_response);
    }

    public function ordersList(Request $request)
    {
        $orders = GooselyPurchaseOrder::with(['line_items'])
            ->when($request->get('q'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->orWhere('id', 'LIKE', '%' . $request->q . '%');
                    // $q->orWhere('due_date', 'LIKE', '%' . $request->q . '%');
                    $q->orWhere('vendor_id', 'LIKE', '%' . $request->q . '%');
                    $q->orWhere('reference_no', 'LIKE', '%' . $request->q . '%');
                    $q->orWhere('document_no', 'LIKE', '%' . $request->q . '%');
                    $q->orWhere('intacct_purchase_order_id', 'LIKE', '%' . $request->q . '%');
                    $q->orWhere('intacct_invoice_number', 'LIKE', '%' . $request->q . '%');
                });
            })->when($request->get('q5'), function ($q) use ($request) {
                $q->when($request->get('q5') == "id asc", function ($q) {
                    $q->orderBy("id", "asc");
                });
                $q->when($request->get('q5') == "id desc", function ($q) {
                    $q->orderBy("id", "desc");
                });
            })->cursorPaginate($request->page_count);


        return responseJson(true, 'Orders Recieved Successfully!', $orders);
    }

    public function logsList(Request $request)
    {
        $logs = MavenLog::when($request->get('q'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->orWhere('id', 'LIKE', '%' . $request->q . '%');
                $q->orWhere('json', 'LIKE', '%' . $request->q . '%');
            });
        })->when($request->get('sort'), function ($q) use ($request) {
            $q->orderBy(...explode(' ', $request->get('sort')));
        })->cursorPaginate($request->page_count);

        return responseJson(true, 'Logs retrieved successfully!', $logs);
    }

    public function addAttachmentParent(Request $request) {

        $validator = Validator::make($request->all(), [
            'attachment' => 'required|file',
        ], []);

        if ($validator->fails()) return simpleValidate($validator);

        $request->file('attachment');

        // Get the file name
        $fileName = $request->file('attachment')->getClientOriginalName();

        // Get the file name without extension
        $fileNameWithoutExtension = pathinfo($fileName, PATHINFO_FILENAME);
        // Get the file extension
        $extension = $request->file('attachment')->getClientOriginalExtension();

        // Get the file content and convert to base64
        $fileContent = file_get_contents($request->file('attachment')->getPathName());
        $base64File = base64_encode($fileContent);
        // dd($base64File);

        $response = $this->addAttachment($fileNameWithoutExtension, $extension, $base64File);
        $generalStatus = $response['operation']['result']['status'] ?? "failure";

        $fileName = $fileNameWithoutExtension . '.' . $extension;
        if($response['operation']['result']['status'] == 'failure'){
            $this->saveApiCall("addAttachment", json_encode($fileName), json_encode($response), $generalStatus);
        }

        $response = $this->getAttachmentByRecordNo($response['operation']['result']['key']);

        $final_response["success"] = true;
        $final_response["message"] = "File Added Successfully to Intacct";
        $final_response["supdocid"] = $response['operation']['result']['data']['supdoc']['supdocid'];

        $this->saveApiCall("addAttachment", json_encode($fileName), json_encode($final_response), $generalStatus);
        return response()->json($final_response);
    }

    public function mavenListing(){
        return Inertia::render('Applications/Maven/Goosely/MavenOrders');
    }

    public function mavenOrders(){
        $orders = MavenCall::when(request('q'), function ($q) {
            $q->where('name', 'LIKE', '%' . request('q') . '%');
            $q->orWhere('payload', 'LIKE', '%' . request('q') . '%');
            $q->orWhere('response', 'LIKE', '%' . request('q') . '%');
            $q->orWhere('status', 'LIKE', '%' . request('q') . '%');
        })->when(request('q2'), function ($q) {
            $q->whereIn('status', json_decode(request('q2')));
        })
        ->when(request('sort'), function ($q) {
            $q->orderBy(...explode(' ', request('sort')));
        })->cursorPaginate(request('page_count'));
        $data['orders'] = $orders;
        return responseJson(true, 'Orders Recieved Successfully!', $data);
    }
}
