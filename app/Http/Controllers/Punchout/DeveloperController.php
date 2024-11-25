<?php

namespace App\Http\Controllers\Punchout;

use App\Models\Punchout\PomwGatewayClient;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\AllInOne\User;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Models\Punchout\PomwCatalog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\Punchout\PomwProcurementNetwork;

class DeveloperController extends Controller
{
    public function gatewayClientsList(Request $request)
    {
        $clients = PomwGatewayClient::with('pomw_client_network')->when($request->get('q'), function ($q) {
            $q->where(function ($q) {
                $q->orWhereHas('pomw_client_network', function ($q) {
                    $q->where('name', 'like', '%' . request()->get('q') . '%');
                })->orWhere('name', 'like', '%' . request()->get('q') . '%')
                    ->orWhere('domain', 'like', '%' . request()->get('q') . '%');
            });
        })->when($request->get('sort'), function ($q) use ($request) {
            $q->orderBy(...explode(' ', $request->get('sort')));
        })->when($request->get('q2'), function ($q) use ($request) {
            $q->whereIn('network_id', json_decode($request->get('q2')));
        })->cursorPaginate($request->page_count);

        $networks = PomwProcurementNetwork::get();

        return responseJson(true, 'Sessions retrieved Successfully retrieved successfully!', $clients, $networks);
    }

    public function getNetworks()
    {
        $networks = PomwProcurementNetwork::orderBy('name', 'asc')->get();
        $names = User::where('role_id', 2)->orderBy('name', 'asc')->pluck('name');
        $clients = PomwGatewayClient::orderBy('name', 'asc')->get();
        return responseJson(true, 'Networks retrieved successfully!', [$networks, $names, $clients]);
    }

    public function createGatewayClient(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'fromDomain' => 'required|string|max:255',
            'toDomain' => 'required|string|max:255',
            'selectedNetwork' => 'required|string|max:255',
            'fromIdentity' => 'required|string|max:255',
            'toIdentity' => 'required|string|max:255',
            'invoice_receiver_url' => 'required|string|max:255',
            'discount_code' => 'required|boolean',
        ]);

        if ($validator->fails())
            return simpleValidate($validator);

        $user = User::whereName($request['name'])->first();

        if (!$user) {
            return sendResponse(false, 'User not found!');
        }

        $gatewayClientExists = PomwGatewayClient::where('domain', $user->name)->exists();

        if ($gatewayClientExists) {
            return sendResponse(false, 'Gateway client already exists!');
        }

        try {
            DB::beginTransaction();
            // Create and save the GatewayClient
            $gatewayClient = new PomwGatewayClient();
            $gatewayClient->name = $user->name . ' Shopify Gateway Client';
            $gatewayClient->domain = $user->name;
            $gatewayClient->from_domain = $request['fromDomain'];
            $gatewayClient->to_domain = $request['toDomain'];
            $gatewayClient->network_id = (int) $request['selectedNetwork'];
            $gatewayClient->from_identity = $request['fromIdentity'];
            $gatewayClient->to_identity = $request['toIdentity'];
            $gatewayClient->invoice_receiver_url = $request['invoice_receiver_url'];
            $gatewayClient->uuid = Str::uuid();
            $gatewayClient->shared_secret = Str::random(16);
            $gatewayClient->uri = Str::random(16);
            $gatewayClient->parser_id = 1;
            $gatewayClient->type_id = 4;
            $gatewayClient->account_id = 1;
            $gatewayClient->credentials_password = Hash::make($request['credentials_password']);
            $gatewayClient->enable_discount_coupons = $request->discount_code;
            $gatewayClient->save();

            $catalog = new PomwCatalog();
            $catalog->account_id = $gatewayClient->account_id;
            $catalog->type_id = 1;
            $catalog->network_id = $gatewayClient->network_id;
            $catalog->name = $gatewayClient->name;
            $catalog->domain = $gatewayClient->domain;
            $catalog->uuid = Str::uuid();
            $catalog->shared_secret = $gatewayClient->shared_secret;
            $catalog->punchout_url = route('punchout.gateway.punchout', $gatewayClient->uuid);
            $catalog->order_transfer_url = route('punchout.gateway.order.request', $gatewayClient->uuid);
            $catalog->profile_url = '';
            $catalog->uri = Str::random(16);
            $catalog->to_domain = $gatewayClient->to_domain;
            $catalog->to_identity = $gatewayClient->to_identity;
            $catalog->from_identity = $gatewayClient->from_identity;
            $catalog->from_domain = $gatewayClient->from_domain;
            $catalog->save();

            $user->uuid = $gatewayClient->uuid;
            $user->save();


            DB::commit();

            return sendResponse(true, 'Gateway client created successfully!', $gatewayClient);
        } catch (\Exception $e) {
            DB::rollBack();
            return sendResponse(false, 'there is an error');
        }
    }

    public function createCXMLPost(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'client' => 'required',
            'endPoint' => 'required',
            'data' => [
                'required',
                function ($attribute, $value, $fail) {
                    // Check if the data is a valid XML
                    if (!is_string($value) || !@simplexml_load_string($value)) {
                        $fail('The ' . $attribute . ' must be a valid XML format.');
                    }
                },
            ],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'errors', 'errors' => $validator->errors()], 422);
        }

        $client = PomwGatewayClient::find($request->client);

        switch ($request->endPoint) {
            case "punchoutsetup":
                $url = $client->getPunchoutStartUrl();
                break;

            case "orderrequest":
                $url = $client->getOrderRequestUrl();
                break;

            case "invoicereceiver":
                $url = $client->getInvoiceReceiverUrl();
                break;
        }
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 20,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => $request->data,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/xml',
            ],
        ]);
        $response = curl_exec($curl);


        if (curl_errno($curl)) {
            $error_msg = curl_error($curl);
            curl_close($curl);
            return response()->json(['error' => $error_msg], 500);
        }

        $http_status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        return response()->json(['success' => $http_status === 500  ? false : true , 'data' => $response], $http_status);
    }
}
