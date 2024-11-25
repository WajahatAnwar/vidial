<?php

namespace App\Http\Controllers\InConnect;

use App\Http\Controllers\Controller;
use App\Models\AllInOne\User;
use App\Models\InConnect\DecoratorData;
use App\Models\InConnect\InconnectOrder;
use Illuminate\Http\Request;
use App\Models\InConnect\GooselyRule;
use App\Traits\GeneralTrait;

class EditOrderController extends Controller
{
    use GeneralTrait;

    public function getEditOrder(Request $request)
    {
        $user = User::find($request->user_id);
        $response = $user->api()->rest('GET', "admin/api/2024-04/orders/$request->order_id.json");
        $decorator_data = DecoratorData::whereIn('type', ['logo_group', 'logo_location', 'decoration', 'personalization_input'])->get();

        if ($response['status'] >= 200  && $response['status'] < 300)
            return sendResponse(true, 'Order details shown', $response['body']['order'], $decorator_data);
        else {
            return sendResponse(false, 'Order details not found', $response);
        }
    }

    public function updateOrder(Request $request)
    {
        $user = User::find($request->user_id);
        $inconnectOrder = InconnectOrder::where('shopify_order_id', $request->order_id)->first();

        $orderPayload = $request->order;

        $orderResponse = $user->api()->rest('GET', '/admin/api/2023-10/orders/' . $inconnectOrder->shopify_order_id . '.json');
        $shopifyOrder = $orderResponse['body']['order'];

        $shopifyOrderArray = json_decode(json_encode($shopifyOrder), true);

        //VALIDATIONS
        $refinedLineItems = [];
        foreach ($orderPayload['line_items'] as $key1 => $item) {
            if(isset($item['custom_properties'])) {
                $line_item_properties = [];
                foreach ($item['custom_properties'] as $key2 => $custom_property) {
                    if($custom_property['selected_property_name'] == false)
                        return sendResponse(false, "Property Name is required for Line Item Property");
                    if($custom_property['selected_property_value'] == null || $custom_property['selected_property_value'] == "")
                        return sendResponse(false, "Property Value is required for Line Item Property");

                    // $object = new StdClass();
                    $object['key'] = $custom_property['selected_property_name']['label'];
                    $object['value'] = $custom_property['selected_property_value'];
                    $line_item_properties[] = $object;
                }
                $shopifyOrderArray['line_items'][$key1]['properties'] = $line_item_properties;
            }
        }

        $shopifyOrder = json_decode(json_encode($shopifyOrderArray));

        $order = $this->graphQLOrderResponse($inconnectOrder->shopify_order_id, $user);
        // Log::info(json_encode($order));
        $gooselyRule = $this->gooselyRuleProcess($order);
        $order = json_decode(json_encode($order), true);
        $order['original'] = $order;
        $this->decideDecorator($user, $shopifyOrder, $inconnectOrder, $order, $gooselyRule, true);
        // Only Test
        // $this->decideDecorator($user, $shopifyOrder, $inconnectOrder, $order, $gooselyRule, false, true);

        return sendResponse(true, "Idex Order Job is queued. If properties are correct then Order Will be placed on Idex");
    }
}
