<?php

namespace App\Traits\Racoon;
use App\Mail\Racoon\FraudOrderMail;
use App\Models\Racoon\Restriction;
use Illuminate\Support\Facades\Mail;
use App\Models\Racoon\RestrictionCollection;
use App\Models\AllInOne\Order;

trait RestrictionTrait
{
    public function checkIfFraud($user, $payload, $order)
    {
        $productIds = [];
        $customerEmail = $payload->customer->email;
        $customerTags = explode(', ', $payload->customer->tags);

        foreach($payload->line_items as $line_item){
            $productIds[] = $line_item->product_id;
        }

        // if any of the product(s) in order belongs to any restricted collection in racoon database
        foreach ($productIds as $productId) {
            $collectionHandles = $this->getProductCollectionHandles($user, $productId);

            if(RestrictionCollection::whereIn('handle', $collectionHandles)->exists()){

                $restrictedCollections = RestrictionCollection::whereIn('handle', $collectionHandles)->get();
                $is_fraud = false;
                foreach ($restrictedCollections as $restrictedCollection) {
                    if (!isset($restrictedCollection->restriction)) {
                        continue;
                    }

                    $restriction = $restrictedCollection->restriction;

                    if(in_array($restriction->id, $user->restrictions()->pluck('id')->toArray())){
                        // if yes, then check if the order customer's email is from the emails listed with restricted collection in racoon database
                        $restrictionEmails = $restriction->emails()->pluck('email')->toArray();
                        /*start -- https://3.basecamp.com/5293232/buckets/34717198/card_tables/cards/7697452717********************/
                        $customerEmail = strtolower($customerEmail);
                        $restrictionEmails = array_map('strtolower',$restrictionEmails);
                        /*end -- https://3.basecamp.com/5293232/buckets/34717198/card_tables/cards/7697452717********************/
                        if(in_array($customerEmail, $restrictionEmails)){
                            $is_fraud = false;
                            break;
                        }

                        // if not, then check if the order customer has any of the tags listed with restricted collection in racoon database
                        $restrictionTags = $restriction->tags()->pluck('tag')->toArray();
                        if(count(array_intersect($customerTags, $restrictionTags)) > 0){
                            $is_fraud = false;
                            break;
                        }

                        $is_fraud = true;
                    }
                }


                if($is_fraud){

                    // if neither is true, and the order is from a restricted collection then we mark it as fraud i.e true

                    if($restriction->auto_cancel){
                        $this->cancelOrder($order);
                    }else{

                        $data = [
                            'subject' => 'Fraud Order Detected',
                            'order_name' => $order->order_name,
                            'body' => "Hi, we have detected a fraud order with the following details: \n\nOrder ID: " . $order->order_id . "\nCustomer Email: " . $order->email . "\n\nThis order has been put to hold, please take action from Racoon App!",
                            'email' => $restriction->notification_email,
                        ];

                        if($restriction->notification_email) {
                            $message = (new FraudOrderMail($data))->onQueue('que_orders');
                            Mail::to($data['email'])->queue($message);
                        }

                        $order->on_hold = true;
                        $order->restriction_id = $restriction->id;
                    }

                    $order->is_fraud = true;
                    $order->save();

                    return true;
                }
            }
        }

        return false;
    }

    private function getProductCollectionHandles($user, $productId)
    {
        $collections = [];

        try {
            $query = <<<GRAPHQL
            query {
                product(id: "gid://shopify/Product/$productId") {
                    collections(first: 250) {
                        edges {
                            node {
                                handle
                            }
                        }
                    }
                }
            }
            GRAPHQL;

            $response = $user->api()->graph($query);

            if (!empty($response['body']['data']['product']['collections']['edges'])) {
                foreach ($response['body']['data']['product']['collections']['edges'] as $edge) {
                    $node = $edge['node'];
                    $collections[] = $node['handle'];
                }
            }
        } catch (\Exception $e) {
            logger()->error('Error fetching collections: ' . $e->getMessage());
        }

        return $collections;
    }

    public function cancelOrder(Order $order){
        if($user = $order->user){

            $update_response = $user->api()->rest('put', '/admin/api/2024-01/orders/'. $order->order_id . '.json', [
                "order" => [
                    "tags" => "fraud, cancelled-by:cc-cloud"
                ]
            ]);

            if ($update_response['errors']) {
                logger()->error('Error updating order: ' . json_encode($update_response, JSON_PRETTY_PRINT ));
            }

            $cancel_response = $user->api()->rest('post', '/admin/api/2024-01/orders/'. $order->order_id . '/cancel.json', [
                "reason" => "fraud",
                "restock"=> true
            ]);

            if ($cancel_response['errors']) {
                logger()->error('Error cancelling order: ' . json_encode($cancel_response, JSON_PRETTY_PRINT ));
            }

            if($restriction = Restriction::find($order->restriction_id)){
                if($restriction->notifications_enabled){
                    $data = [
                        'subject' => 'Fraud Order Detected',
                        'order_name' => $order->order_name,
                        'body' => "Hi, the detected fraud order with the following details: \n\nOrder ID: " . $order->order_id . "\nCustomer Email: " . $order->email . "\n\nhas been cancelled and marked as fraudulent!",
                        'email' => $restriction->notification_email,
                    ];

                    if($restriction->notification_email) {
                        $message = (new FraudOrderMail($data))->onQueue('que_orders');
                        Mail::to($data['email'])->queue($message);
                    }
                }
            }
        }
    }
}
