<?php

namespace App\Http\Controllers\InConnect;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AllInOne\User;
use App\Jobs\InConnect\GetTrackingNumberJob;
use App\Models\InConnect\VendorPurchaseOrder;

class TestControllerTwo extends Controller
{
    public function getOrders()
    {
        $order_ids = [];
        $order_names = [];
        $maids = [];
        $user = User::find(254);
    
        foreach($order_names as $name){
            $query = <<<GRAPHQL
            {
                orders(first: 10,query: "$name") {
                    edges {
                        node {
                            id,
                            legacyResourceId
                        }
                    }
                }
            }
            GRAPHQL;
            $order = $user->api()->graph($query); 
            $id = ($order['body']['data']['orders']['edges'][0]['node']['legacyResourceId']);
            array_push($order_ids,$id);
        }

        logger()->info('Ali log');
        logger()->info(json_encode($order_ids));
    }
}
