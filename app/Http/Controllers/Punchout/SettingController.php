<?php

namespace App\Http\Controllers\Punchout;

use App\Http\Controllers\Controller;
use App\Models\Punchout\PomwCatalog;
use App\Models\Punchout\PomwCatalogType;
use App\Models\Punchout\PomwGatewayClient;
use App\Models\Punchout\PomwProcurementStreetAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SettingController extends Controller
{
    public function getCatalogs(Request $request)
    {
        $catalogs = PomwCatalog::
            when($request->has('q'), function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->get('q') . '%');
            })
            ->when($request->has('sort'), function ($q) use ($request) {
                $q->orderBy(...explode(' ', $request->get('sort')));
            })
            ->cursorPaginate($request->page_count);
        return sendResponse(true, 'Catalogs retrieved successfully!', $catalogs);
    }
    public function getGatewayClient(Request $request)
    {
        $gatewayClients = PomwGatewayClient::
            when($request->has('q'), function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->get('q') . '%');
            })
            ->when($request->has('sort'), function ($q) use ($request) {
                $q->orderBy(...explode(' ', $request->get('sort')));
            })
            ->cursorPaginate($request->page_count);
        return sendResponse(true, 'Gateway Clients retrieved successfully!', $gatewayClients);
    }
    public function getAccountAddress(Request $request)
    {
        $accountAddress = PomwProcurementStreetAddress::
            when($request->has('q'), function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->get('q') . '%');
            })
            ->when($request->has('sort'), function ($q) use ($request) {
                $q->orderBy(...explode(' ', $request->get('sort')));
            })
            ->cursorPaginate($request->page_count);
        return sendResponse(true, 'Account Addresses retrieved successfully!', $accountAddress);
    }

    public function createAccountAddress(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'deliver_to' => 'required',
            'ident' => 'required',
            'label' => 'required',
            'line1' => 'required',
            'city' => 'required',
            'state' => 'required',
            'postal_code' => 'required',
            'iso_country_code' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'errors', 'errors' => $validator->errors()], 422);
        }

        try {

            DB::beginTransaction();

            $accountAddress = new PomwProcurementStreetAddress();
            $accountAddress->deliver_to = $request->deliver_to;
            $accountAddress->account_id = 1;
            $accountAddress->ident = $request->ident;
            $accountAddress->label = $request->label;
            $accountAddress->line1 = $request->line1;
            $accountAddress->line2 = $request->line2;
            $accountAddress->city = $request->city;
            $accountAddress->state = $request->state;
            $accountAddress->zip = $request->postal_code;
            $accountAddress->country = $request->iso_country_code;
            $accountAddress->save();

            DB::commit();

            return sendResponse(true, 'Account Address created successfully!', $accountAddress);

        } catch (\Exception $e) {
            DB::rollBack();
            return sendResponse(false, 'there is an error');
        }
    }
}
