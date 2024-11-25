<?php

namespace App\Http\Controllers\Punchout;

use App\Http\Controllers\Controller;
use App\Models\AllInOne\User;
use App\Models\Punchout\AccountFile;
use App\Models\Punchout\PomwCustomQuote;
use App\Models\Punchout\PomwCustomQuoteItem;
use App\Models\Punchout\PomwCustomQuoteItemType;
use App\Models\Punchout\PomwGatewayClient;
use App\Models\Punchout\PomwGatewayClientDiscountCode;
use App\Models\Punchout\PomwGatewayClientDiscountCodeType;
use App\Models\Punchout\PomwGatewayClientDiscountCodeUsageType;
use App\Models\Punchout\PomwGatewayClientProductQuantityLimit;
use App\Services\Punchout\CustomQuoteProductCreationRoutine;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ToolsController extends Controller
{
    public function getCustomQuote(Request $request)
    {
        $customQuote = PomwCustomQuote::
            when($request->has('q'), function ($q) use ($request) {
                $q->where('sku', 'like', '%' . $request->get('q') . '%');
            })
            ->when($request->has('sort'), function ($q) use ($request) {
                $q->orderBy(...explode(' ', $request->get('sort')));
            })
            ->withCount('customQuoteItems')
            ->cursorPaginate($request->page_count);
        return sendResponse(true, 'Custom Quotes retrieved successfully!', $customQuote);
    }
    public function getDiscountCodes(Request $request)
    {
        $discountCode = PomwGatewayClientDiscountCode::
            when($request->has('q'), function ($q) use ($request) {
                $q->where('label', 'like', '%' . $request->get('q') . '%')
                    ->orWhere('value', 'like', '%' . $request->get('q') . '%');
            })
            ->when($request->has('sort'), function ($q) use ($request) {
                $q->orderBy(...explode(' ', $request->get('sort')));
            })
            ->cursorPaginate($request->page_count);
        return sendResponse(true, 'Discount Codes retrieved successfully!', $discountCode);
    }
    public function getProductQuantity(Request $request)
    {
        $productQuantity = PomwGatewayClientProductQuantityLimit::
            when($request->has('q'), function ($q) use ($request) {
                $q->where('gatewayClient.name', 'like', '%' . $request->get('q') . '%');
            })
            ->when($request->has('sort'), function ($q) use ($request) {
                $q->orderBy(...explode(' ', $request->get('sort')));
            })
            ->cursorPaginate($request->page_count);
        return sendResponse(true, 'Product Quantity Limits retrieved successfully!', $productQuantity);
    }
    public function getDiscountCodeById($id)
    {
        $discountCode = PomwGatewayClientDiscountCode::find($id);
        return sendResponse(true, 'Discount Code retrieved successfully!', $discountCode);
    }
    public function getDiscountCodeOptions()
    {
        $clients = PomwGatewayClient::orderBy('name', 'asc')->get();
        $types = PomwGatewayClientDiscountCodeType::all();
        $usage = PomwGatewayClientDiscountCodeUsageType::all();
        return responseJson(true, 'Discount Code options retrieved successfully!', [$types, $clients, $usage]);
    }
    public function getCustomQuoteItems(Request $request, $id)
    {
        $customQuoteItem = PomwCustomQuoteItem::where('quote_id', $id)
            ->when($request->has('q'), function ($q) use ($request) {
                $q->where('description', 'like', '%' . $request->get('q') . '%');
            })
            ->when($request->has('sort'), function ($q) use ($request) {
                $q->orderBy(...explode(' ', $request->get('sort')));
            })
            ->cursorPaginate($request->page_count);
        return sendResponse(true, 'Custom Quotes retrieved successfully!', $customQuoteItem);
    }

    public function getTypes()
    {
        $types = PomwCustomQuoteItemType::get();
        $websites = User::where('role_id', 2)->get();
        return responseJson(true, 'Custom Quote Types retrieved successfully!', [$types, $websites]);
    }

    public function createLineItems(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'description' => 'required',
            'unitPrice' => 'required',
            'quantity' => 'required',
            'type' => 'required',
            'id' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'errors', 'errors' => $validator->errors()], 422);
        }

        try {

            DB::beginTransaction();

            $fingerprint = Str::random('8');

            $lineItem = new PomwCustomQuoteItem();
            $lineItem->description = $request->description;
            $lineItem->unit_of_measure = 'EA';
            $lineItem->classification = '80141605';
            $lineItem->supplier_part_id = $request->description . '/' . $fingerprint . "/CustomQuote/LineItem";
            $lineItem->supplier_auxiliary_id = $request->description . '/' . $fingerprint . "/CustomQuote/LineItem";
            $lineItem->unit_price = $request->unitPrice;
            $lineItem->quantity = $request->quantity;
            $lineItem->type_id = $request->type;
            $lineItem->uuid = Str::uuid();
            $lineItem->quote_id = $request->id;
            $lineItem->save();

            DB::commit();

            return sendResponse(true, 'Line Item created successfully!', $lineItem);

        } catch (\Exception $e) {
            DB::rollBack();
            return sendResponse(false, 'there is an error');
        }
    }
    public function deleteLineItems(PomwCustomQuoteItem $lineItem)
    {
        $lineItem->delete();
        return sendResponse(true, 'Line Item deleted successfully!');
    }
    public function createQuote(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'sku' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'errors', 'errors' => $validator->errors()], 422);
        }

        try {

            DB::beginTransaction();

            $quote = new PomwCustomQuote();
            $quote->account_id = 1;
            $quote->creator_id = auth()->user()->id;
            $quote->search_tag = str::random(10);
            $quote->uuid = Str::uuid();
            $quote->sku = $request->sku;
            if ($request->file != "null") {
                $file = $request->file('file');
                $file_name = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension();
                $size = $file->getSize();
                $dateHash = Str::random(40);
                $systemName = $dateHash . '.' . $extension;
                $path = 'clubcolors/quote';
                if (!Storage::exists($path)) {
                    Storage::makeDirectory($path);
                }
                $location = $path . '/' . $systemName;
                $file->storeAs($path, $systemName, 'public');
                $accountFile = new AccountFile();
                $accountFile->account_id = 1;
                $accountFile->creator_id = auth()->user()->id;
                $accountFile->parent_directory = 'quote';
                $accountFile->file_name = $file_name;
                $accountFile->system_name = $systemName;
                $accountFile->full_path = $location;
                $accountFile->public_uri = 'storage/' . $path . '/' . $systemName;
                $accountFile->extension = $extension;
                $accountFile->size = $size;
                $accountFile->save();
                $quote->picture_file_id = $accountFile->id;
            }
            $quote->save();

            DB::commit();

            return sendResponse(true, 'Line Item created successfully!', $quote);

        } catch (\Exception $e) {
            DB::rollBack();
            return sendResponse(false, 'there is an error');
        }
    }
    public function createProductQuantity(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'client' => 'required',
            'csv' => 'required|file|mimes:csv,txt',
            'action' => 'required|in:overwrite,add',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'errors', 'errors' => $validator->errors()], 422);
        }

        try {

            DB::beginTransaction();

            $client = $request->client;
            $action = $request->action;
            $client = PomwGatewayClient::find($client);
            if (!$client) {
                return response()->json(['success' => false, 'message' => 'errors', 'errors' => 'client not found'], 422);
            }
            if ($request->hasFile('csv')) {
                $file = $request->file('csv');
                $tmp_file = $file->getRealPath();
                if ($action === 'overwrite') {
                    PomwGatewayClientProductQuantityLimit::where('client_id', $client->id)->delete();
                }
                if (($handle = fopen($tmp_file, 'r')) !== FALSE) {
                    $row = 0;
                    while (($datum = fgetcsv($handle, 0, ",")) !== FALSE) {
                        if ($row == 0) {
                            $datum[0] = preg_replace('/^\xEF\xBB\xBF/', '', $datum[0]);
                        }
                        // dd($datum);
                        $row++;
                        if ($row > 0) {
                            $productQuantity = new PomwGatewayClientProductQuantityLimit();
                            $productQuantity->client_id = $client->id;
                            $productQuantity->handle = $datum[0];
                            $productQuantity->min = $datum[1];
                            $productQuantity->max = $datum[2];
                            $productQuantity->multiple = $datum[3];
                            $productQuantity->save();
                        }
                    }
                    fclose($handle);
                }
            }

            DB::commit();

            return sendResponse(true, 'Product Quantity Limits created successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            return sendResponse(false, 'there is an error');
        }
    }
    public function createSingleProductQuantity(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'client' => 'required',
            'min' => 'required',
            'max' => 'required',
            'handle' => 'required',
            'multiple' => 'required',
            'action' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'errors', 'errors' => $validator->errors()], 422);
        }

        try {

            DB::beginTransaction();

            $client = $request->client;
            $action = $request->action;
            $client = PomwGatewayClient::find($client);
            if (!$client) {
                return response()->json(['success' => false, 'message' => 'errors', 'errors' => 'client not found'], 422);
            }
            if ($action === 'overwrite') {
                PomwGatewayClientProductQuantityLimit::where('client_id', $client->id)->delete();
            }
            $productQuantity = new PomwGatewayClientProductQuantityLimit();
            $productQuantity->client_id = $client->id;
            $productQuantity->handle = $request->handle;
            $productQuantity->min = $request->min;
            $productQuantity->max = $request->max;
            $productQuantity->multiple = $request->multiple;
            $productQuantity->save();

            DB::commit();

            return sendResponse(true, 'Product Quantity Limits created successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            return sendResponse(false, 'there is an error');
        }
    }
    public function createDiscountCode(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'value' => 'required|numeric',
                'label' => 'required',
                'type' => 'required',
                'usage' => 'required',
                'client' => 'required_if:id,present',
                'clients' => 'required_without:id|array',
                'date.start' => 'required',
            ],
            [
                'clients.required_without' => 'Please select a client',
                'date.start.required' => 'Please select an expiry date!',
            ]
        );

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'errors', 'errors' => $validator->errors()], 422);
        }

        if ($request->id) {
            try {

                DB::beginTransaction();

                $discountCode = PomwGatewayClientDiscountCode::find($request->id);
                $discountCode->client_id = $request->client;
                $discountCode->type_id = $request->type;
                $discountCode->usage_type_id = $request->usage;
                $discountCode->label = $request->label;
                $discountCode->value = $request->value;
                $discountCode->max_discount = $request->max_discount;
                $discountCode->expiry_date = Carbon::parse($request->date['start']);
                $discountCode->uuid = Str::uuid();
                if ($request->type === '3') {
                    $initial_balance = $request->value;
                    $discountCode->initial_balance = $initial_balance;
                    $discountCode->current_balance = $initial_balance;
                }

                $discountCode->save();

                DB::commit();

                return sendResponse(true, 'Discount Code Updated successfully!', $discountCode);

            } catch (\Exception $e) {
                DB::rollBack();
                return sendResponse(false, 'there is an error');
            }
        } else {
            try {
                DB::beginTransaction();
                foreach ($request->clients as $client) {
                    $discountCode = new PomwGatewayClientDiscountCode();
                    $discountCode->client_id = $client;
                    $discountCode->type_id = $request->type;
                    $discountCode->usage_type_id = $request->usage;
                    $discountCode->label = $request->label;
                    $discountCode->value = $request->value;
                    $discountCode->max_discount = $request->max_discount;
                    $discountCode->expiry_date = Carbon::parse($request->date['start']);
                    $discountCode->uuid = Str::uuid();
                    if ($request->type === '3') {
                        $initial_balance = $request->value;
                        $discountCode->initial_balance = $initial_balance;
                        $discountCode->current_balance = $initial_balance;
                    }

                    $discountCode->save();
                }
                DB::commit();

                return sendResponse(true, 'Discount Code created successfully!', $discountCode);

            } catch (\Exception $e) {
                DB::rollBack();
                return sendResponse(false, 'there is an error', $e->getMessage());
            }
        }
    }

    public function pushToShopify(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'website' => 'required',
            'taxable' => 'required:boolean',
            'id' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'errors', 'errors' => $validator->errors()], 422);
        }

        $quote = PomwCustomQuote::find($request->id);

        $result = $this->pushDataToShopify($quote, $request->website, $request->taxable);
        if ($result['status'] === 'success') {
            return response()->json(['success' => $result['message']]);
        } else {
            return response()->json(['error' => $result['message']], 400);
        }
    }

    private function pushDataToShopify(PomwCustomQuote $quote, $appCredentialId, $shouldBeTaxable)
    {
        $routine = new CustomQuoteProductCreationRoutine($quote, $appCredentialId, $shouldBeTaxable);

        $id = $routine->doTransfer();

        if ($id) {
            $quote->shopify_product_id = $id;
            $quote->pushed = 1;
            $quote->save();

            return ['status' => 'success', 'message' => 'Shopify product created with search tag: ' . $quote->search_tag];
        }

        return ['status' => 'fail', 'message' => 'Unknown error'];
    }

    public function deleteProductQuantity($id)
    {
        $productQuantity = PomwGatewayClientProductQuantityLimit::find($id);
        $productQuantity->delete();
        return sendResponse(true, 'Product Quantity Limits deleted successfully!');
    }

    public function deleteDiscountCode($id)
    {
        $productQuantity = PomwGatewayClientDiscountCode::find($id);
        $productQuantity->delete();
        return sendResponse(true, 'Discount Code deleted successfully!');
    }

    public function deleteCustomQuote($id)
    {
        $quote = PomwCustomQuote::findOrFail($id);
        if ($quote->picture_file_id) {
            $accountFile = AccountFile::find($quote->picture_file_id);
            if ($accountFile) {
                Storage::disk('public')->delete($accountFile->full_path);
                $accountFile->delete();
            }
        }
        PomwCustomQuoteItem::where('quote_id', $quote->id)->delete();
        $quote->delete();
        return sendResponse(true, 'Discount Code deleted successfully!');
    }

}
