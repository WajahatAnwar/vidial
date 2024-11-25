<?php

namespace App\Http\Controllers\Racoon;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AllInOne\User;

class TestController extends Controller
{
    public function test(){
  
        $user = User::find(5);
               

        $query = <<<GRAPHQL
        {
            product(id: "gid://shopify/Product/7539858833615") {
              legacyResourceId
              title
              tracksInventory
              totalInventory
              variants(first: 250) {
                edges {
                    node {
                        id
                        legacyResourceId
                        title
                        selectedOptions {
                            name
                            value
                        }
                        inventoryQuantity
                        sku
                        price
                        image {
                            url
                        }
                    }
                }
              }
            }
        }
        GRAPHQL;

        try {
            $result = $user->api()->graph($query);
            dd($result);
        } catch (\Exception $e) {
            dd($e->getMessage());
        }

    }
}
