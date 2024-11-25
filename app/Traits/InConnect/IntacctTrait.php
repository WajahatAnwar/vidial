<?php

namespace App\Traits\InConnect;

use App\Models\AllInOne\ProductVariant;
use Carbon\Carbon;
use App\Models\InConnect\InconnectOrder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

trait IntacctTrait
{
    function replace_ampersand($payload)
    {
        $filtered = str_replace('&', '&amp;', json_encode($payload));
        return json_decode($filtered, true);
    }

    public function callToSageApi($xmlRequest)
    {
        try {
            $response = Http::connectTimeout(300)->timeout(300)->contentType('application/xml')->send('POST', env('INTACCT_API_URL'), [
                'body' => $xmlRequest
            ]);

            $responseBody = $response->body();
            $xml = simplexml_load_string($responseBody);
            $json = json_encode($xml);
            return json_decode($json, true);
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    private function getSessionID($level = 'club_colors')
    {
        $senderId = env('INTACCT_SENDER_ID');
        $senderPassword = env('INTACCT_SENDER_PASSWORD');
        $timestamp = now()->timestamp;
        $userId = env('INTACCT_USER_ID');
        $companyId = env('INTACCT_COMPANY_ID');
        $userPassword = env('INTACCT_USER_PASSWORD');
        $userLocation = env('INTACCT_LOCATION_ID');

        $locationFinal = $level == 'club_colors' ? <<<LOCATIONID
          <locationid>{$userLocation}</locationid>
        LOCATIONID : '';
        $guid = 'gguid';

        $xmlRequest = <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
            <request>
                <control>
                    <senderid>$senderId</senderid>
                    <password>$senderPassword</password>
                    <controlid>$timestamp</controlid>
                    <uniqueid>false</uniqueid>
                    <dtdversion>3.0</dtdversion>
                    <includewhitespace>false</includewhitespace>
                </control>
                <operation>
                    <authentication>
                        <login>
                            <userid>$userId</userid>
                            <companyid>$companyId</companyid>
                            <password>$userPassword</password>
                            {$locationFinal}
                        </login>
                    </authentication>
                    <content>
                        <function controlid="$guid">
                            <getAPISession />
                        </function>
                    </content>
                </operation>
            </request>
        XML;

        $apiCall = $this->callToSageApi($xmlRequest);

        if (!isset($apiCall['operation']['result']['data']['api']['sessionid']))
            logger("JIXI: UNDEFINED OPREATION ERROR: " . json_encode($apiCall));

        return $apiCall['operation']['result']['data']['api']['sessionid'];
    }

    public function getVendors($query = null)
    {
        $sessionId = $this->getSessionID();

        $senderId = env('INTACCT_SENDER_ID');
        $senderPassword = env('INTACCT_SENDER_PASSWORD');
        $timestamp = now()->timestamp;
        $guid = 'gguid';

        $xmlRequest = <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
            <request>
                <control>
                <senderid>$senderId</senderid>
                <password>$senderPassword</password>
                <controlid>$timestamp</controlid>
                <uniqueid>false</uniqueid>
                <dtdversion>3.0</dtdversion>
                <includewhitespace>false</includewhitespace>
                </control>
                <operation>
                <authentication>
                    <sessionid>$sessionId</sessionid>
                </authentication>
                <content>
                    <function controlid="{{$guid}}">
                    <readByQuery>
                        <object>VENDOR</object>
                        <fields>*</fields>
                        <query>NAME LIKE '%$query%'</query>
                        <pagesize>500</pagesize>
                    </readByQuery>
                    </function>
                </content>
                </operation>
            </request>
        XML;
        $apiCall = $this->callToSageApi($xmlRequest);
        if (!isset($apiCall['operation'])) {
            return [];
        }

        if (!isset($apiCall['operation']['result']['data'])) {
            return [];
        }

        $vendors = $apiCall['operation']['result']['data'];
        if ($vendors['@attributes']['count'] == "0") {
            return [];
        }

        if ($vendors['@attributes']['count'] == 1) {
            $vendors = [$vendors['vendor']];
        } else {
            $vendors = $vendors['vendor'] ?? [];
        }
        return $vendors;
    }

    private function getItemByID($item_id)
    {
        $sessionId = $this->getSessionID();

        $senderId = env('INTACCT_SENDER_ID');
        $senderPassword = env('INTACCT_SENDER_PASSWORD');
        $timestamp = now()->timestamp;
        $guid = 'gguid';

        $xmlRequest = <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
            <request>
                <control>
                <senderid>$senderId</senderid>
                <password>$senderPassword</password>
                <controlid>{{$timestamp}}</controlid>
                <uniqueid>false</uniqueid>
                <dtdversion>3.0</dtdversion>
                <includewhitespace>false</includewhitespace>
                </control>
                <operation>
                <authentication>
                    <sessionid>$sessionId</sessionid>
                </authentication>
                <content>
                    <function controlid="{{$guid}}">
                    <readByName>
                        <object>ITEM</object>
                        <keys>$item_id</keys>
                        <fields>*</fields>
                    </readByName>
                    </function>
                </content>
                </operation>
            </request>
        XML;
        $apiCall = $this->callToSageApi($xmlRequest);
        return $apiCall;
    }

    private function getItemsByQuery($query)
    {
        $query = $this->replace_ampersand($query);

        $sessionId = $this->getSessionID();

        $senderId = env('INTACCT_SENDER_ID');
        $senderPassword = env('INTACCT_SENDER_PASSWORD');
        $timestamp = now()->timestamp;
        $guid = 'gguid';

        $xmlRequest = <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
            <request>
                <control>
                <senderid>$senderId</senderid>
                <password>$senderPassword</password>
                <controlid>{{$timestamp}}</controlid>
                <uniqueid>false</uniqueid>
                <dtdversion>3.0</dtdversion>
                <includewhitespace>false</includewhitespace>
                </control>
                <operation>
                <authentication>
                    <sessionid>$sessionId</sessionid>
                </authentication>
                <content>
                    <function controlid="{{$guid}}">
                    <readByQuery>
                        <object>ITEM</object>
                        <fields>*</fields>
                        <query>$query</query>
                        <pagesize>100</pagesize>
                    </readByQuery>
                    </function>
                </content>
                </operation>
            </request>
        XML;
        $items = $this->callToSageApi($xmlRequest);
        $items = $items['operation']['result']['data'];
        if ($items['@attributes']['count'] == 1) {
            $items = [$items['item']];
        } else {
            $items = $items['item'];
        }
        return $items;
    }

    private function getDataByQuery($query, $type)
    {
        $sessionId = $this->getSessionID();

        $senderId = env('INTACCT_SENDER_ID');
        $senderPassword = env('INTACCT_SENDER_PASSWORD');
        $timestamp = now()->timestamp;
        $guid = 'gguid';

        $xmlRequest = <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
            <request>
                <control>
                <senderid>$senderId</senderid>
                <password>$senderPassword</password>
                <controlid>{{$timestamp}}</controlid>
                <uniqueid>false</uniqueid>
                <dtdversion>3.0</dtdversion>
                <includewhitespace>false</includewhitespace>
                </control>
                <operation>
                <authentication>
                    <sessionid>$sessionId</sessionid>
                </authentication>
                <content>
                    <function controlid="{{$guid}}">
                    <readByQuery>
                        <object>{$type}</object>
                        <fields>*</fields>
                        <query>$query</query>
                        <pagesize>100</pagesize>
                    </readByQuery>
                    </function>
                </content>
                </operation>
            </request>
        XML;
        $queryResponse = $this->callToSageApi($xmlRequest);
        if ($type == "Contact") {
            $queryResponse = $queryResponse['operation']['result']['data'];
            if ($queryResponse['@attributes']['count'] == 1) {
                $queryResponse = [$queryResponse['contact']];
            } else {
                $queryResponse = $queryResponse['contact'] ?? [];
            }
            return $queryResponse;
        } else if ($type == "CUSTOMER" || $type == "VENDOR" || $type == "SODOCUMENT") {
            return $queryResponse;
        }
    }

    public function createItem($payload, $platform = "goosely")
    {
        $payload = $this->replace_ampersand($payload);

        $sessionId = $this->getSessionID("top_level");

        $senderId = env('INTACCT_SENDER_ID');
        $senderPassword = env('INTACCT_SENDER_PASSWORD');
        $timestamp = now()->timestamp;
        $guid = 'gguid';

        $net_weight = $payload['shipping_weight'] - 0.01;

        $description = isset($payload['description']) ? $payload['description'] : $payload['title'];

        // GETTING ITEM BY DATABASE FIRST. IF NOT FOUND THEN CREATE NEW ITEM
        $db_found = ProductVariant::where('sku', $payload['item_id'])->whereNotNull('intacct_item_id')->first();
        if ($db_found) {
            // logger("ITEM ALREADY AVAILABLE: " . $db_found->intacct_item_id);
            return $db_found->intacct_item_id;
        }

        $item = $this->getItemByID($payload['item_id']);

        $gl_group = "BrandShop";
        if ($platform == "maven")
            $gl_group = "Integrated Sales Transactions";

        if ($item['operation']['result']['data']['@attributes']['count'] > 0) {

            if ($platform == "goosely")
                return @$item['operation']['result']['data']['ITEM']['ITEMID'];
            else if ($platform == "maven")
                return @$item;
        } else {

            // ITEM ID NOW MODIFIED. IF GREATER THAN 30 THAN MAKE RANDOM ID OF 25 CHARACTERS
            if (strlen($payload['item_id']) > 30)
                $payload['item_id'] = Str::random(25);

            $itemPrice = abs($payload['price']);

            $xmlRequest = <<<XML
            <?xml version="1.0" encoding="UTF-8"?>
                <request>
                <control>
                    <senderid>$senderId</senderid>
                    <password>$senderPassword</password>
                    <controlid>$timestamp</controlid>
                    <uniqueid>false</uniqueid>
                    <dtdversion>3.0</dtdversion>
                    <includewhitespace>false</includewhitespace>
                </control>
                <operation>
                    <authentication>
                    <sessionid>$sessionId</sessionid>
                    </authentication>
                    <content>
                    <function controlid="{{$guid}}">
                        <create>
                        <ITEM>
                            <ITEMID>{$payload['item_id']}</ITEMID>
                            <NAME>{$payload['title']}</NAME>
                            <EXTENDED_DESCRIPTION>{$description}</EXTENDED_DESCRIPTION>
                            <PODESCRIPTION>{$description}</PODESCRIPTION>
                            <SODESCRIPTION>{$description}</SODESCRIPTION>
                            <BASEPRICE>{$itemPrice}</BASEPRICE>
                            <TAXABLE>true</TAXABLE>
                            <ITEMTYPE>Inventory</ITEMTYPE>
                            <GLGROUP>{$gl_group}</GLGROUP>
                            <WEIGHTUOM>Grams</WEIGHTUOM>
                            <NETWEIGHT>{$net_weight}</NETWEIGHT>
                            <SHIP_WEIGHT>{$payload['shipping_weight']}</SHIP_WEIGHT>
                            <BRAND>{$payload['brand']}</BRAND>
                            <SUBBRAND>{$payload['subbrand']}</SUBBRAND>
                            <CATEGORY>{$payload['category']}</CATEGORY>
                            <SUBCATEGORY>{$payload['subcategory']}</SUBCATEGORY>
                            <COLOR>{$payload['color']}</COLOR>
                            <WEBENABLED>true</WEBENABLED>
                            <SIZE1>{$payload['size1']}</SIZE1>
                            <STYLE>{$payload['style']}</STYLE>
                        </ITEM>
                        </create>
                    </function>
                    </content>
                </operation>
                </request>
            XML;
        }

        $product = $this->callToSageApi($xmlRequest);
        // logger("ITEM CREATED: " . json_encode($product));

        if ($platform == "goosely")
            return @$product['operation']['result']['data']['item']['ITEMID'];
        else if ($platform == "maven")
            return @$item;
    }

    public function createPurchaseOrder($payload, $type = 'Purchase Order')
    {
        $payload = $this->replace_ampersand($payload);

        $sessionId = $this->getSessionID();

        $datedue = '';
        if (isset($payload['due_date']) && $type != 'Vendor Invoice - Shopify') {
            $due_date = Carbon::parse($payload['due_date']);
            $due_day = $due_date->day;
            $due_month = $due_date->month;
            $due_year = $due_date->year;

            $datedue = <<<DATEDUE
            <datedue>
            <year>$due_year</year>
            <month>$due_month</month>
            <day>$due_day</day>
            </datedue>
            DATEDUE;
        }

        $datecreated = '';
        if (isset($payload['date'])) {
            $date_created = Carbon::parse($payload['date']);
            $date_created_year = $date_created->year;
            $date_created_day = $date_created->day;
            $date_created_month = $date_created->month;

            $datecreated = <<<DATECREATED
            <datecreated>
            <year>$date_created_year</year>
            <month>$date_created_month</month>
            <day>$date_created_day</day>
            </datecreated>
            DATECREATED;
        } else {
            $date = Carbon::now();
            $year = $date->year;
            $month = $date->month;
            $day = $date->day;


            $datecreated = <<<DATECREATED
            <datecreated>
            <year>$year</year>
            <month>$month</month>
            <day>$day</day>
            </datecreated>
            DATECREATED;
        }

        $dateposted = '';
        if (isset($payload['gl_posting_date'])) {
            $dateposted = Carbon::parse($payload['gl_posting_date']);
            $dateposted_year = $dateposted->year;
            $dateposted_day = $dateposted->day;
            $dateposted_month = $dateposted->month;

            $dateposted = <<<DATEPOSTED
            <dateposted>
            <year>$dateposted_year</year>
            <month>$dateposted_month</month>
            <day>$dateposted_day</day>
            </dateposted>
            DATEPOSTED;
        }

        $senderId = env('INTACCT_SENDER_ID');
        $senderPassword = env('INTACCT_SENDER_PASSWORD');
        $timestamp = now()->timestamp;
        $guid = 'gguid';
        $line_items = $payload['line_items'];
        $items = '';
        $createdfrom = $type == 'Purchase Cost' ? '' : ($type == 'Vendor Invoice' || $type == 'Vendor Invoice - Shopify' ? <<<CREATEDFROM
        <createdfrom>{$payload['intact_po_number']}</createdfrom>
        CREATEDFROM : '');

        $vendordocno = $type == 'Purchase Cost' ? <<<DOCUMENTNO
        <vendordocno>{$payload['document_no']}</vendordocno>
        DOCUMENTNO : ($type == 'Vendor Invoice' || $type == 'Vendor Invoice - Shopify' ? (isset($payload['vendor_doc_no']) ? <<<DOCUMENTNO
        <vendordocno>{$payload['vendor_doc_no']}</vendordocno>
        DOCUMENTNO : <<<DOCUMENTNO
        <vendordocno>{$payload['document_no']}</vendordocno>
        DOCUMENTNO) : '');

        foreach ($line_items as $line_item) {
            $item_id = trim($line_item['item_id']);
            $employee_include = isset($line_item['employee_id']) ? <<<INSIDEITEM
            <employeeid>{$line_item['employee_id']}</employeeid>
          INSIDEITEM : '';
            $class_include = isset($line_item['class_id']) ? <<<INSIDEITEM
            <classid>{$line_item['class_id']}</classid>
          INSIDEITEM : '';

            $items .= <<<ITEM
            <potransitem>
            <itemid>{$item_id}</itemid>
            <quantity>{$line_item['quantity']}</quantity>
            <unit>Each</unit>
            <price>{$line_item['price']}</price>
            <locationid>{$line_item['location_id']}</locationid>
            <departmentid>{$line_item['department_id']}</departmentid>
            {$employee_include}
            {$class_include}
            </potransitem>
            ITEM;
        }

        $termname = isset($payload['term_name']) ? <<<TERMNAME
        <termname>{$payload['term_name']}</termname>
        TERMNAME : '';

            $message = isset($payload['message']) ? <<<MESSAGE
        <message>{$payload['message']}</message>
        MESSAGE : '';

            $shippingmethod = isset($payload['shipping_method']) ? <<<SHIPPINGMETHOD
        <shippingmethod>{$payload['shipping_method']}</shippingmethod>
        SHIPPINGMETHOD : '';

        $supdocidout = isset($payload['supdocid']) ? $payload['supdocid'] : '';

        $xmlRequest = <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
            <request>
                <control>
                <senderid>$senderId</senderid>
                <password>$senderPassword</password>
                <controlid>$timestamp</controlid>
                <uniqueid>false</uniqueid>
                <dtdversion>3.0</dtdversion>
                <includewhitespace>false</includewhitespace>
                </control>
                <operation>
                <authentication>
                    <sessionid>$sessionId</sessionid>
                </authentication>
                <content>
                    <function controlid="{{$guid}}">
                    <create_potransaction>
                        <transactiontype>$type</transactiontype>
                        {$datecreated}
                        {$dateposted}
                        {$createdfrom}
                        <vendorid>{$payload['vendor_id']}</vendorid>
                        <documentno>{$payload['document_no']}</documentno>
                        <referenceno>{$payload['reference_no']}</referenceno>
                        {$vendordocno}
                        {$termname}
                        {$datedue}
                        {$message}
                        {$shippingmethod}
                        <returnto>
                        <contactname></contactname>
                        </returnto>
                        <payto>
                        <contactname></contactname>
                        </payto>
                        <supdocid>{$supdocidout}</supdocid>
                        <potransitems>
                        $items
                        </potransitems>
                    </create_potransaction>
                    </function>
                </content>
                </operation>
            </request>
        XML;

        $order = $this->callToSageApi($xmlRequest);
        // logger()->info(json_encode($xmlRequest, JSON_PRETTY_PRINT));
        return $order;
    }

    //OLD LOGIC WAS CREATED FOR THE SAVAGE OF DAMAGE FROM CUSTOM QUOTES LOGIC
    public function createSalesOrder($user, $payload, $type = 'Sales Order', $platform = 'goosely', $process = "normal", $oldLogic = false, $onlyTest = false, $oldTax = false)
    {
        $payload = $this->replace_ampersand($payload);

        $sessionId = $this->getSessionID();

        $datedue = '';
        if (isset($payload['due_date'])) {
            $due_date = Carbon::parse($payload['due_date']);
            $due_day = $due_date->day;
            $due_month = $due_date->month;
            $due_year = $due_date->year;

            $datedue = <<<DATEDUE
            <datedue>
            <year>$due_year</year>
            <month>$due_month</month>
            <day>$due_day</day>
            </datedue>
            DATEDUE;
        }

        $datecreated = '';
        if (isset($payload['date'])) {
            $date_created = Carbon::parse($payload['date']);
            $date_created_year = $date_created->year;
            $date_created_day = $date_created->day;
            $date_created_month = $date_created->month;

            $datecreated = <<<DATECREATED
            <datecreated>
            <year>$date_created_year</year>
            <month>$date_created_month</month>
            <day>$date_created_day</day>
            </datecreated>
            DATECREATED;
        } else {
            $date = Carbon::now();
            $year = $date->year;
            $month = $date->month;
            $day = $date->day;


            $datecreated = <<<DATECREATED
            <datecreated>
            <year>$year</year>
            <month>$month</month>
            <day>$day</day>
            </datecreated>
            DATECREATED;
        }

        $dateposted = '';
        if (isset($payload['gl_posting_date'])) {
            $dateposted = Carbon::parse($payload['gl_posting_date']);
            $dateposted_year = $dateposted->year;
            $dateposted_day = $dateposted->day;
            $dateposted_month = $dateposted->month;

            $dateposted = <<<DATEPOSTED
            <dateposted>
            <year>$dateposted_year</year>
            <month>$dateposted_month</month>
            <day>$dateposted_day</day>
            </dateposted>
            DATEPOSTED;
        }

        $senderId = env('INTACCT_SENDER_ID');
        $senderPassword = env('INTACCT_SENDER_PASSWORD');
        $timestamp = now()->timestamp;
        $guid = 'gguid';


        if ($payload['total_tax'] > 0) {
            $items = $this->getItemsByQuery("PRODUCTLINEID LIKE '%Accrued Sales Tax%'");

            // ST-35 SOLUTION
            if (!$oldTax)
                $items = collect($items)->sortByDesc('NAME')->values();
            $tax_line_names = collect($payload['tax_lines'])->pluck('title');
            $new_taxes = $tax_line_names->toArray();

            $oldTaxWorkforExistingSalesOrder = false;
            $inconnectOrder = InconnectOrder::where('shopify_order_name', @$payload['name'])->first();
            if ($inconnectOrder && $inconnectOrder->old_tax_true) {
                $oldTaxWorkforExistingSalesOrder = true;
            }

            if ($payload['shipping_address']['province'] && !$oldTaxWorkforExistingSalesOrder)
                $new_taxes[] = $payload['shipping_address']['province'];
            $tax_line_names = collect($new_taxes);
            // logger(json_encode($tax_line_names));
            $item = collect($items)->filter(function ($value) use ($tax_line_names) {
                $name = explode(' ', $value['NAME']);
                return $tax_line_names->some(function ($value) use ($name) {
                    return  str_contains($value, $name[count($name) - 1]);
                });
            })->first();
        }
        $line_items = $payload['line_items'];
        $items = '';
        foreach ($line_items as $line_item) {

            //15-02-2024 THIS CHECK IS FOR CUSTOM QUOTES PRODUCTS THAT THEY MUST NOT GO TO INTACT. IT WILL NOT EFFECT DISCOUNT AND SHIPPING PRODUCT
            if ($platform == "goosely")
                if ((@$line_item['item_id'] == null && @$line_item['product_id'] == null && @$line_item['variant_id'] == null) && ($line_item['item_id'] != "Discount" || $line_item['item_id'] != "SHIP001"))
                    continue;

            if ($oldLogic)
                if (@$line_item['sku'] == null && @$line_item['product_id'] == null && @$line_item['variant_id'] == null)
                    continue;

            $item_id = trim($line_item['item_id']);
            $employee_include = isset($line_item['employee_id']) ? <<<INSIDEITEM
            <employeeid>{$line_item['employee_id']}</employeeid>
            INSIDEITEM : '';

            $items .= <<<ITEM
            <sotransitem>
            <itemid>{$item_id}</itemid>
            <quantity>{$line_item['quantity']}</quantity>
            <unit>Each</unit>
            <price>{$line_item['price']}</price>
            <locationid>{$line_item['location_id']}</locationid>
            <departmentid>{$line_item['department_id']}</departmentid>
            {$employee_include}
            <classid>{$line_item['class_id']}</classid>
            </sotransitem>
            ITEM;
        }

        if ($payload['total_tax'] > 0 && $process == "normal") {
            $items .= <<<ITEM
            <sotransitem>
            <itemid>{$item['ITEMID']}</itemid>
            <quantity>1</quantity>
            <unit>Each</unit>
            <price>{$payload['total_tax']}</price>
            <locationid>{$payload['location_id']}</locationid>
            <departmentid>{$payload['department_id']}</departmentid>
            <classid>{$payload['class_id']}</classid>
            </sotransitem>
            ITEM;
        }

        if (!$payload['shipping_address'] && $payload['billing_address']) {
            $payload['shipping_address'] = $payload['billing_address'];
        }

        $shipping_line = collect($payload['shipping_lines'])->where('code', "Boston Office Pickup")->first();

        if ($shipping_line) {
            $shipping_line = collect($payload['shipping_lines'])->where('code', "Boston Office Pickup")->first();
            $locations = $user->api()->rest('GET', '/admin/api/2024-01/locations.json');
            $locationsShopify = collect($locations['body']['locations']);
            $location = $locationsShopify->where('name', $shipping_line['code'])->first();
            $payload['shipping_address'] = $location;
        }

        try {
            if ($platform == "goosely") {
                $contact = $this->getOrCreateContact([
                    'order_name' => $payload['name'],
                    'name' => $payload['shipping_address']['first_name'] . ' ' . $payload['shipping_address']['last_name'] . ' (' . $payload['company_id'] . ')-Ship',
                    'company_name' => $payload['company_name'],
                    'email' => $payload['customer']['email'],
                    'address1' => $payload['shipping_address']['address1'],
                    'address2' => $payload['shipping_address']['address2'],
                    'city' => $payload['shipping_address']['city'],
                    'state' => $payload['shipping_address']['province'],
                    'zip' => $payload['shipping_address']['zip'],
                    'country' => $payload['shipping_address']['country'],
                    'country_code' => $payload['shipping_address']['country_code'],
                ]);

                $contact_two = $this->getOrCreateContact([
                    'order_name' => $payload['name'],
                    'name' => $payload['billing_address']['first_name'] . ' ' . $payload['billing_address']['last_name'] . ' (' . $payload['company_id'] . ')-Bill',
                    'company_name' => $payload['company_name'],
                    'email' => $payload['customer']['email'],
                    'address1' => $payload['billing_address']['address1'],
                    'address2' => $payload['billing_address']['address2'],
                    'city' => $payload['billing_address']['city'],
                    'state' => $payload['billing_address']['province'],
                    'zip' => $payload['billing_address']['zip'],
                    'country' => $payload['billing_address']['country'],
                    'country_code' => $payload['billing_address']['country_code'],
                ]);
            } else if ($platform == "maven") {
                $contact = $this->getOrCreateContact([
                    'order_name' => $payload['shipping_address']['name'] . ' (' . $payload['company_id'] . ')',
                    'name' => $payload['shipping_address']['name'] . ' (' . $payload['company_id'] . ')-Ship',
                    'company_name' => $payload['company_name'],
                    'email' => $payload['shipping_address']['email'],
                    'address1' => $payload['shipping_address']['address1'],
                    'address2' => $payload['shipping_address']['address2'],
                    'city' => $payload['shipping_address']['city'],
                    'state' => $payload['shipping_address']['province'],
                    'zip' => $payload['shipping_address']['zip'],
                    'country' => $payload['shipping_address']['country'],
                    'country_code' => $payload['shipping_address']['country_code'],
                ]);

                $contact_two = $this->getOrCreateContact([
                    'order_name' => $payload['billing_address']['name'] . ' (' . $payload['company_id'] . ')',
                    'name' => $payload['billing_address']['name'] . ' (' . $payload['company_id'] . ')-Bill',
                    'company_name' => $payload['company_name'],
                    'email' => $payload['billing_address']['email'],
                    'address1' => $payload['billing_address']['address1'],
                    'address2' => $payload['billing_address']['address2'],
                    'city' => $payload['billing_address']['city'],
                    'state' => $payload['billing_address']['province'],
                    'zip' => $payload['billing_address']['zip'],
                    'country' => $payload['billing_address']['country'],
                    'country_code' => $payload['billing_address']['country_code'],
                ]);
            }
        } catch (\Exception $e) {
            logger()->error("contact error: " . $e->getMessage());
        }

        $contact['CONTACTNAME'] = $this->replace_ampersand(@$contact['CONTACTNAME']);
        $contact_two['CONTACTNAME'] = $this->replace_ampersand(@$contact_two['CONTACTNAME']);

        $createdfrom = $type == 'Sales Order' ? '' : <<<CREATEDFROM
        <createdfrom>{$payload['intact_so_number']}</createdfrom>
        CREATEDFROM;
        $documentno = $type == 'Sales Order' ? '' : <<<DOCUMENTNO
        <documentno>{$payload['document_no']}</documentno>
        DOCUMENTNO;

        $shippingmethod = isset($payload['shipping_method']) ? <<<SHIPPINGMETHOD
        <shippingmethod>{$payload['shipping_method']}</shippingmethod>
        SHIPPINGMETHOD : '';

        $customfields = isset($payload['tax_exempt_number']) ? <<<CUSTOMFIELDS
        <customfields>
            <customfield>
                <customfieldname>TAX_EXEMPT_NUMBER</customfieldname>
                <customfieldvalue>{$payload['tax_exempt_number']}</customfieldvalue>
            </customfield>
        </customfields>
        CUSTOMFIELDS : '';

        $supdocidout = isset($payload['supdocid']) ? $payload['supdocid'] : '';

        if ($platform == "maven")
            $type = "Sales Invoice Maven";

        $xmlRequest = <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
            <request>
                <control>
                <senderid>$senderId</senderid>
                <password>$senderPassword</password>
                <controlid>$timestamp</controlid>
                <uniqueid>false</uniqueid>
                <dtdversion>3.0</dtdversion>
                <includewhitespace>false</includewhitespace>
                </control>
                <operation>
                <authentication>
                    <sessionid>$sessionId</sessionid>
                </authentication>
                <content>
                    <function controlid="{{$guid}}">
                    <create_sotransaction>
                        <transactiontype>$type</transactiontype>
                        {$datecreated}
                        {$dateposted}
                        {$createdfrom}
                        <customerid>{$payload['customer_id']}</customerid>
                        {$documentno}
                        <referenceno>{$payload['reference_no']}</referenceno>
                        <termname>{$payload['term_name']}</termname>
                        {$datedue}
                        <message>{$payload['message']}</message>
                        {$shippingmethod}
                        <shipto>
                        <contactname>{$contact['CONTACTNAME']}</contactname>
                        </shipto>
                        <billto>
                        <contactname>{$contact_two['CONTACTNAME']}</contactname>
                        </billto>
                        <supdocid>{$supdocidout}</supdocid>
                        <basecurr>{$payload['currency']}</basecurr>
                        <currency>{$payload['currency']}</currency>
                        <exchratetype>Intacct Daily Rate</exchratetype>
                        {$customfields}
                        <state>Pending</state>
                        <customerponumber>{$payload['customer_po']}</customerponumber>
                        <sotransitems>
                        $items
                        </sotransitems>
                    </create_sotransaction>
                    </function>
                </content>
                </operation>
            </request>
        XML;

        if ($onlyTest) {
            // logger("ONLY TESTING SALES ORDER");
            // logger($items);
            // logger(json_encode($payload));
            // logger($type);
            return true;
        }

        $order = $this->callToSageApi($xmlRequest);
        // logger($xmlRequest);
        return $order;
    }

    public function getLocations()
    {
        $sessionId = $this->getSessionID();

        $senderId = env('INTACCT_SENDER_ID');
        $senderPassword = env('INTACCT_SENDER_PASSWORD');
        $timestamp = now()->timestamp;
        $guid = 'gguid';

        $xmlRequest = <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
            <request>
                <control>
                <senderid>$senderId</senderid>
                <password>$senderPassword</password>
                <controlid>$timestamp</controlid>
                <uniqueid>false</uniqueid>
                <dtdversion>3.0</dtdversion>
                <includewhitespace>false</includewhitespace>
                </control>
                <operation>
                <authentication>
                    <sessionid>$sessionId</sessionid>
                </authentication>
                <content>
                    <function controlid="{{$guid}}">
                    <readByQuery>
                        <object>LOCATION</object>
                        <fields>*</fields>
                        <query/>
                        <pagesize>100</pagesize>
                    </readByQuery>
                    </function>
                </content>
                </operation>
            </request>
        XML;

        $locations = $this->callToSageApi($xmlRequest);
        $locations = $locations['operation']['result']['data'];
        if ($locations['@attributes']['count'] == 1) {
            $locations = [$locations['location']];
        } else {
            $locations = $locations['location'];
        }
        return $locations;
    }

    public function getDepartments()
    {
        $sessionId = $this->getSessionID();

        $senderId = env('INTACCT_SENDER_ID');
        $senderPassword = env('INTACCT_SENDER_PASSWORD');
        $timestamp = now()->timestamp;
        $guid = 'gguid';

        $xmlRequest = <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
            <request>
                <control>
                <senderid>$senderId</senderid>
                <password>$senderPassword</password>
                <controlid>$timestamp</controlid>
                <uniqueid>false</uniqueid>
                <dtdversion>3.0</dtdversion>
                <includewhitespace>false</includewhitespace>
                </control>
                <operation>
                <authentication>
                    <sessionid>$sessionId</sessionid>
                </authentication>
                <content>
                    <function controlid="{{$guid}}">
                    <readByQuery>
                        <object>DEPARTMENT</object>
                        <fields>*</fields>
                        <query/>
                        <pagesize>100</pagesize>
                    </readByQuery>
                    </function>
                </content>
                </operation>
            </request>
        XML;

        $departments = $this->callToSageApi($xmlRequest);
        $departments = $departments['operation']['result']['data'];
        if ($departments['@attributes']['count'] == 1) {
            $departments = [$departments['department']];
        } else {
            $departments = $departments['department'];
        }
        return $departments;
    }

    public function getCustomers()
    {
        $sessionId = $this->getSessionID();

        $senderId = env('INTACCT_SENDER_ID');
        $senderPassword = env('INTACCT_SENDER_PASSWORD');
        $timestamp = now()->timestamp;
        $guid = 'gguid';

        $xmlRequest = <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
            <request>
                <control>
                <senderid>$senderId</senderid>
                <password>$senderPassword</password>
                <controlid>$timestamp</controlid>
                <uniqueid>false</uniqueid>
                <dtdversion>3.0</dtdversion>
                <includewhitespace>false</includewhitespace>
                </control>
                <operation>
                <authentication>
                    <sessionid>$sessionId</sessionid>
                </authentication>
                <content>
                    <function controlid="{{$guid}}">
                    <readByQuery>
                        <object>CUSTOMER</object>
                        <fields>*</fields>
                        <query/>
                        <pagesize>200</pagesize>
                    </readByQuery>
                    </function>
                </content>
                </operation>
            </request>
        XML;

        $customers = $this->callToSageApi($xmlRequest);
        $customers = $customers['operation']['result']['data'];
        if ($customers['@attributes']['count'] == 1) {
            $customers = [$customers['customer']];
        } else {
            $customers = $customers['customer'];
        }
        return $customers;
    }

    public function getClasses()
    {
        $sessionId = $this->getSessionID();

        $senderId = env('INTACCT_SENDER_ID');
        $senderPassword = env('INTACCT_SENDER_PASSWORD');
        $timestamp = now()->timestamp;
        $guid = 'gguid';

        $xmlRequest = <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
            <request>
                <control>
                <senderid>$senderId</senderid>
                <password>$senderPassword</password>
                <controlid>$timestamp</controlid>
                <uniqueid>false</uniqueid>
                <dtdversion>3.0</dtdversion>
                <includewhitespace>false</includewhitespace>
                </control>
                <operation>
                <authentication>
                    <sessionid>$sessionId</sessionid>
                </authentication>
                <content>
                    <function controlid="{{$guid}}">
                    <readByQuery>
                        <object>CLASS</object>
                        <fields>*</fields>
                        <query/>
                        <pagesize>100</pagesize>
                    </readByQuery>
                    </function>
                </content>
                </operation>
            </request>
        XML;

        $classes = $this->callToSageApi($xmlRequest);
        $classes = $classes['operation']['result']['data'];
        if ($classes['@attributes']['count'] == 1) {
            $classes = [$classes['class']];
        } else {
            $classes = $classes['class'];
        }
        return $classes;
    }

    public function getOrCreateContact($payload)
    {
        $name_refined = replaceSpecialCharacters($payload['name']);
        $name_refined = trim($name_refined);

        $contactList = collect($this->getDataByQuery("CONTACTNAME LIKE '%{$name_refined}%'", "Contact"));
        // $item = false;
        $item = $contactList->first();
        $contactList->each(function ($value) use (&$item, $payload) {
            if ($value['MAILADDRESS.ADDRESS1'] == $payload['address1'] && $value['MAILADDRESS.ADDRESS2'] == $payload['address2']) {
                $item = $value;
            }
        });

        $sessionId = $this->getSessionID();

        $senderId = env('INTACCT_SENDER_ID');
        $senderPassword = env('INTACCT_SENDER_PASSWORD');
        $timestamp = now()->timestamp;
        $guid = 'gguid';

        //   $payload['contact_name'] = $name_refined . '-Ship-' . $payload['order_name'];
        $payload['printas'] = $name_refined;

        if ($item) {

            $item = $this->replace_ampersand($item);

            $xmlRequest = <<<XML
            <?xml version="1.0" encoding="UTF-8"?>
                <request>
                <control>
                    <senderid>$senderId</senderid>
                    <password>$senderPassword</password>
                    <controlid>$timestamp</controlid>
                    <uniqueid>false</uniqueid>
                    <dtdversion>3.0</dtdversion>
                    <includewhitespace>false</includewhitespace>
                </control>
                <operation>
                    <authentication>
                    <sessionid>$sessionId</sessionid>
                    </authentication>
                    <content>
                    <function controlid="{{$guid}}">
                        <update>
                        <CONTACT>
                            <CONTACTNAME>{$item['CONTACTNAME']}</CONTACTNAME>
                            <PRINTAS>{$payload['printas']}</PRINTAS>
                            <COMPANYNAME>{$payload['company_name']}</COMPANYNAME>
                            <EMAIL1>{$payload['email']}</EMAIL1>
                            <MAILADDRESS>
                            <ADDRESS1>{$payload['address1']}</ADDRESS1>
                            <ADDRESS2>{$payload['address2']}</ADDRESS2>
                            <CITY>{$payload['city']}</CITY>
                            <STATE>{$payload['state']}</STATE>
                            <ZIP>{$payload['zip']}</ZIP>
                            <COUNTRY>{$payload['country']}</COUNTRY>
                            <COUNTRYCODE>{$payload['country_code']}</COUNTRYCODE>
                            </MAILADDRESS>
                        </CONTACT>
                        </update>
                    </function>
                    </content>
                </operation>
                </request>
            XML;

            $existing_contact = $this->callToSageApi($xmlRequest);
            // logger($xmlRequest);
            // logger("contact 2: " . json_encode($existing_contact));
            return $existing_contact['operation']['result']['data']['contact'];
        }

        $xmlRequest = <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
            <request>
                <control>
                <senderid>$senderId</senderid>
                <password>$senderPassword</password>
                <controlid>$timestamp</controlid>
                <uniqueid>false</uniqueid>
                <dtdversion>3.0</dtdversion>
                <includewhitespace>false</includewhitespace>
                </control>
                <operation>
                <authentication>
                    <sessionid>$sessionId</sessionid>
                </authentication>
                <content>
                    <function controlid="{{$guid}}">
                    <create>
                        <CONTACT>
                        <CONTACTNAME>{$name_refined}</CONTACTNAME>
                        <PRINTAS>{$payload['printas']}</PRINTAS>
                        <COMPANYNAME>{$payload['company_name']}</COMPANYNAME>
                        <EMAIL1>{$payload['email']}</EMAIL1>
                        <MAILADDRESS>
                            <ADDRESS1>{$payload['address1']}</ADDRESS1>
                            <ADDRESS2>{$payload['address2']}</ADDRESS2>
                            <CITY>{$payload['city']}</CITY>
                            <STATE>{$payload['state']}</STATE>
                            <ZIP>{$payload['zip']}</ZIP>
                            <COUNTRY>{$payload['country']}</COUNTRY>
                            <COUNTRYCODE>{$payload['country_code']}</COUNTRYCODE>
                        </MAILADDRESS>
                        </CONTACT>
                    </create>
                    </function>
                </content>
                </operation>
            </request>
        XML;

        $contact = $this->callToSageApi($xmlRequest);
        // logger($xmlRequest);
        // logger("contact 3: " . json_encode($contact));
        // logger()->info($xmlRequest);
        return $contact['operation']['result']['data']['contact'];
    }

    public function createVendor($vendor_name)
    {
        $sessionId = $this->getSessionID("top_level");

        $senderId = env('INTACCT_SENDER_ID');
        $senderPassword = env('INTACCT_SENDER_PASSWORD');
        $timestamp = now()->timestamp;
        $guid = 'gguid';

        $xmlRequest = <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
            <request>
                <control>
                <senderid>$senderId</senderid>
                <password>$senderPassword</password>
                <controlid>$timestamp</controlid>
                <uniqueid>false</uniqueid>
                <dtdversion>3.0</dtdversion>
                <includewhitespace>false</includewhitespace>
                </control>
                <operation>
                <authentication>
                    <sessionid>$sessionId</sessionid>
                </authentication>
                <content>
                    <function controlid="{{$guid}}">
                    <create_vendor>
                        <vendorid></vendorid>
                        <name>{$vendor_name}</name>
                    </create_vendor>
                    </function>
                </content>
                </operation>
            </request>
        XML;

        $vendor = $this->callToSageApi($xmlRequest);
        return $vendor;
    }

    public function createCompany($payload)
    {
        $payload = $this->replace_ampersand($payload);

        $sessionId = $this->getSessionID("top_level");
        $senderId = env('INTACCT_SENDER_ID');
        $senderPassword = env('INTACCT_SENDER_PASSWORD');
        $timestamp = now()->timestamp;
        $guid = 'gguid';

        $name_with_maven = $payload['name'] . " (Maven Customer)";

        $xmlRequest = <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
            <request>
                <control>
                    <senderid>$senderId</senderid>
                    <password>$senderPassword</password>
                    <controlid>$timestamp</controlid>
                    <uniqueid>false</uniqueid>
                    <dtdversion>3.0</dtdversion>
                    <includewhitespace>false</includewhitespace>
                </control>
                <operation>
                    <authentication>
                    <sessionid>$sessionId</sessionid>
                    </authentication>
                    <content>
                    <function controlid="{{$guid}}">
                    <create>
                        <CUSTOMER>
                        <NAME>{$payload['name']}</NAME>
                        <DISPLAYCONTACT>
                            <PRINTAS>{$payload['name']}</PRINTAS>
                            <COMPANYNAME>{$name_with_maven}</COMPANYNAME>
                            <TAXABLE>true</TAXABLE>
                            <MAILADDRESS>
                                <ADDRESS1>{$payload['address1']}</ADDRESS1>
                                <ADDRESS2>{$payload['address2']}</ADDRESS2>
                                <CITY>{$payload['city']}</CITY>
                                <STATE>{$payload['province']}</STATE>
                                <ZIP>{$payload['zip']}</ZIP>
                                <COUNTRY>{$payload['country']}</COUNTRY>
                            </MAILADDRESS>
                        </DISPLAYCONTACT>
                        </CUSTOMER>
                    </create>
                    </function>
                    </content>
                </operation>
            </request>
        XML;
        $order = $this->callToSageApi($xmlRequest);
        // logger()->info(json_encode($xmlRequest, JSON_PRETTY_PRINT));
        return $order;
    }

    public function removeSalesOrder($salesInvoiceId)
    {
        $sessionId = $this->getSessionID();

        $senderId = env('INTACCT_SENDER_ID');
        $senderPassword = env('INTACCT_SENDER_PASSWORD');
        $timestamp = now()->timestamp;
        $guid = 'gguid';

        $xmlRequest = <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
            <request>
                <control>
                <senderid>$senderId</senderid>
                <password>$senderPassword</password>
                <controlid>$timestamp</controlid>
                <uniqueid>false</uniqueid>
                <dtdversion>3.0</dtdversion>
                <includewhitespace>false</includewhitespace>
                </control>
                <operation>
                <authentication>
                    <sessionid>$sessionId</sessionid>
                </authentication>
                <content>
                    <function controlid="{{$guid}}">
                    <delete_sotransaction key="{$salesInvoiceId}"></delete_sotransaction>
                    </function>
                </content>
                </operation>
            </request>
        XML;

        $order = $this->callToSageApi($xmlRequest);
        // logger("SODEL: " . json_encode($order));
        return $order;
    }

    public function removeContact($contact)
    {
        $sessionId = $this->getSessionID();

        $senderId = env('INTACCT_SENDER_ID');
        $senderPassword = env('INTACCT_SENDER_PASSWORD');
        $timestamp = now()->timestamp;
        $guid = 'gguid';

        $xmlRequest = <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
            <request>
                <control>
                <senderid>$senderId</senderid>
                <password>$senderPassword</password>
                <controlid>$timestamp</controlid>
                <uniqueid>false</uniqueid>
                <dtdversion>3.0</dtdversion>
                <includewhitespace>false</includewhitespace>
                </control>
                <operation>
                <authentication>
                    <sessionid>$sessionId</sessionid>
                </authentication>
                <content>
                    <function controlid="{{$guid}}">
                    <delete>
                    <object>CONTACT</object>
                    <keys>$contact</keys>
                    </delete>
                    </function>
                </content>
                </operation>
            </request>
        XML;

        $response = $this->callToSageApi($xmlRequest);
        // logger("CONTACTDEL: " . json_encode($response));
        return $response;
    }

    public function getExistingSalesOrderOrInvoice($salesInvoiceId, $type)
    {
        $salesInvoiceId = $this->replace_ampersand($salesInvoiceId);

        $ordersList = collect($this->getDataByQuery("DOCID LIKE '%{$salesInvoiceId}%'", 'SODOCUMENT'));
        $RECORDNO = @$ordersList['operation']['result']['data']['sodocument']['RECORDNO'];

        $sessionId = $this->getSessionID();

        $senderId = env('INTACCT_SENDER_ID');
        $senderPassword = env('INTACCT_SENDER_PASSWORD');
        $timestamp = now()->timestamp;
        $guid = 'gguid';

        //FIRST IN BELOW CODE I AM GETTING PREVIOUS SALES ORDER OR SALES INVOICE

        $xmlRequest = <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
            <request>
                <control>
                <senderid>$senderId</senderid>
                <password>$senderPassword</password>
                <controlid>$timestamp</controlid>
                <uniqueid>false</uniqueid>
                <dtdversion>3.0</dtdversion>
                <includewhitespace>false</includewhitespace>
                </control>
                <operation>
                <authentication>
                <sessionid>$sessionId</sessionid>
                </authentication>
                <content>
                <function controlid="{{$guid}}">
                    <read>
                    <object>SODOCUMENT</object>
                    <keys>$RECORDNO</keys>
                    <fields>*</fields>
                    <docparid>$type</docparid>
                    </read>
                </function>
                </content>
                </operation>
            </request>
        XML;

        $existing_sales_order = $this->callToSageApi($xmlRequest);
        return $existing_sales_order;
    }

    public function addAttachment($fileName, $extension, $base64File)
    {
        $fileName = $this->replace_ampersand($fileName);

        $sessionId = $this->getSessionID();

        $senderId = env('INTACCT_SENDER_ID');
        $senderPassword = env('INTACCT_SENDER_PASSWORD');
        $timestamp = now()->timestamp;
        $guid = 'gguid';

        $xmlRequest = <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
            <request>
                <control>
                <senderid>$senderId</senderid>
                <password>$senderPassword</password>
                <controlid>$timestamp</controlid>
                <uniqueid>false</uniqueid>
                <dtdversion>3.0</dtdversion>
                <includewhitespace>false</includewhitespace>
                </control>
                <operation>
                <authentication>
                <sessionid>$sessionId</sessionid>
                </authentication>
                <content>
                <function controlid="{{$guid}}">
                    <create_supdoc>
                    <supdocid></supdocid>
                    <supdocname>$fileName</supdocname>
                    <supdocfoldername>Maven</supdocfoldername>
                    <supdocdescription>Maven</supdocdescription>
                    <attachments>
                        <attachment>
                        <attachmentname>$fileName</attachmentname>
                        <attachmenttype>$extension</attachmenttype>
                        <attachmentdata>$base64File</attachmentdata>
                        </attachment>
                    </attachments>
                    </create_supdoc>
                </function>
                </content>
                </operation>
            </request>
        XML;

        $response = $this->callToSageApi($xmlRequest);
        return $response;
    }

    public function getAttachmentByRecordNo($recordNo)
    {
        $sessionId = $this->getSessionID();

        $senderId = env('INTACCT_SENDER_ID');
        $senderPassword = env('INTACCT_SENDER_PASSWORD');
        $timestamp = now()->timestamp;
        $guid = 'gguid';

        $xmlRequest = <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
            <request>
                <control>
                <senderid>$senderId</senderid>
                <password>$senderPassword</password>
                <controlid>$timestamp</controlid>
                <uniqueid>false</uniqueid>
                <dtdversion>3.0</dtdversion>
                <includewhitespace>false</includewhitespace>
                </control>
                <operation>
                <authentication>
                <sessionid>$sessionId</sessionid>
                </authentication>
                <content>
                <function controlid="{{$guid}}">
                    <get_list object="supdoc" maxitems="1">
                    <filter>
                        <expression>
                        <field>recordno</field>
                        <operator>=</operator>
                        <value>$recordNo</value>
                        </expression>
                    </filter>
                    </get_list>
                </function>
                </content>
                </operation>
            </request>
        XML;

        $response = $this->callToSageApi($xmlRequest);
        return $response;
    }
}
