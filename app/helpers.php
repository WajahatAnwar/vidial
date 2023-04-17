<?php

use App\Models\Collection;
use App\Models\CollectionProduct;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
// use Illuminate\Support\Facades\Log;
use Illuminate\Support\HtmlString;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Crypt;
use App\Models\Orders;
use App\Models\Log;
use Mailgun\Mailgun;
use App\Models\EmailTemplate;
use SebastianBergmann\Template\Template;

if (!function_exists('update_log_file')) {
    function update_log_file($data)
    {
        Log::create($data);
    }
}
function vite_assets(): HtmlString
{


    $devServerIsRunning = false;

    if (app()->environment('local')) {
        try {
            Http::get("http://localhost:3000");
            $devServerIsRunning = true;
        } catch (Exception) {
        }
    }

    if ($devServerIsRunning) {
        return new HtmlString(<<<HTML
            <script type="module" src="http://localhost:3000/@vite/client"></script>
            <script type="module" src="http://localhost:3000/resources/js/app.js"></script>
        HTML);
    }

    $manifest = json_decode(file_get_contents(
        public_path('build/manifest.json')
    ), true);

    return new HtmlString(<<<HTML
        <script type="module" src="/build/{$manifest['resources/js/app.js']['file']}"></script>
        <link rel="stylesheet" href="/build/{$manifest['resources/js/app.js']['css'][0]}">
    HTML);
}

function sync_products($request)
{
    $user = User::where('name', $request->name)->first();

    // Log::info(json_encode($user));

    $perPage = 250;
    $productCount = $user->api()->rest('GET', '/admin/api/2022-01/products/count.json')['body']['count'];

    $iterations = ceil($productCount / $perPage);

    $next = null;

    DB::beginTransaction();
    try {

        $user = User::where('name', $request->name)->first();

        $collections_list = array();

        $response2 = $user->api()->rest('get', '/admin/api/2021-10/smart_collections.json');
        // $data = $response2['body']['smart_collections'];
        foreach ($response2['body']['smart_collections'] as $value) {
            array_push($collections_list, $value);
        }

        $response3 = $user->api()->rest('get', '/admin/api/2021-10/custom_collections.json');
        foreach ($response3['body']['custom_collections'] as $value) {
            array_push($collections_list, $value);
        }
        // return $collections_list;
        //new new new new new
        foreach ($collections_list as $key => $value) {

            $image_link = "";
            if (isset($value->image)) {
                $image_link = $value->image->src;
            } else {
                $image_link = '/default_image_src';
            }

            Collection::updateOrCreate([
                'collection_id' => $value['id'],
            ], [
                'collection_title' => $value['title'],
                'collection_handle' => $value['handle'],
                'collection_image' => $image_link,
                'user_id' => $user->id
            ]);
        }

        CollectionProduct::where('user_id', $user->id)->delete();

        $all_collections = Collection::where('user_id', $user->id)->get();

        foreach ($all_collections as $key => $value) {

            //GETTING COLLECTION PRODUCTS ######################################################
            $refined_products = array();

            $perPage = 250;
            $next = null;

            do {

                $response = $user->api()->rest('GET', '/admin/api/2021-10/collections/' . $value->collection_id . '/products.json', [
                    'limit' => $perPage,
                    'page_info' => $next
                ]);

                // return $response;
                foreach ($response['body']['products'] as $product) {
                    array_push($refined_products, $product);
                }

                $link = $response['link'];
                if ($link)
                    $next = $link->next;

                // return count($response['body']['products']);
                if (count($response['body']['products']) < 250)
                    break;
            } while (true);

            // return $refined_products;

            foreach ($refined_products as $key => $value2) {

                $new_collection_product = new CollectionProduct;
                $new_collection_product->user_id = $user->id;
                $new_collection_product->collection_id = $value->collection_id;
                $new_collection_product->product_id = $value2->id;
                $new_collection_product->save();
            }
            //GETTING COLLECTION PRODUCTS ###################################################### END
        }

        for ($i = 0; $i < $iterations; $i++) {
            $response = $user->api()->rest('GET', '/admin/api/2022-01/products.json', [
                'limit' => $perPage,
                'page_info' => $next
            ]);
            foreach ($response['body']['products'] as $product) {

                $image_link = "";
                if (isset($product->image)) {
                    $image_link = $product->image->src;
                } else {
                    $image_link = '/default_image_src';
                }

                Product::updateOrCreate([
                    'product_id' => $product->id,
                ], [
                    'product_tags' => $product['tags'],
                    'product_title' => $product['title'],
                    'product_handle' => $product['handle'],
                    'user_id' => $user->id,
                    'description' => "defauld description",
                    'product_image' => $image_link,
                ]);
            }
            $link = $response['link'];
            if ($link) {
                $next = $link->next;
            }
        }

        DB::commit();

        // $new = Product::where('user_id', $user->id)->get();

        return response()->json([
            'success' => true,
            'message' => 'Products and collections added to the system',
            // 'data' => $new
        ]);
    } catch (Exception $e) {
        DB::rollBack();
        return $e->getMessage();
    }
}
// Dropbox
if (!function_exists('getDropboxToken')) {
    function getDropboxToken()
    {
        $dropbox = Http::withHeaders([
            'Authorization' => 'Basic ' . base64_encode(env('DROPBOX_CLIENT_ID') . ':' . env('DROPBOX_SECRET_ID'))
        ])->asForm()->post('https://api.dropboxapi.com/oauth2/token', [
            'grant_type' => 'authorization_code',
            'code' => env('AUTHORIZATION_CODE', '_UAy1dwO1s4AAAAAAAAAHEFoDnr9-Ppfe8hkLu_Ougw')
        ]);
        return $dropbox->json();
    }
}

if (!function_exists('updateDropboxToken')) {
    function updateDropboxToken()
    {
        $dropbox = Http::withHeaders([
            'Authorization' => 'Basic ' . base64_encode(env('DROPBOX_CLIENT_ID') . ':' . env('DROPBOX_SECRET_ID'))
        ])->asForm()->post('https://api.dropboxapi.com/oauth2/token', [
            'grant_type' => 'refresh_token',
            'refresh_token' => env('REFRESH_TOKEN')
        ]);
        // Config::set('dropbox.accessToken', $dropbox['access_token']);
        return $dropbox->json();
    }

    if (!function_exists('dateFormat')) {
        function dateFormat($date)
        {
            return $date;
            return $newDate = Carbon::createFromFormat('Y-m-d H:i:s', $date)
                ->format('m/d/Y');
        }
    }
}
/***** set language ******/
if (!function_exists('setLan')) {
    function setLan($locale)
    {
        return App::setLocale($locale);
    }
}
/***** Split store name ******/
if (!function_exists('splitStoreName')) {
    function splitStoreName($store)
    {
        $store = explode(".", $store, 2);
        return $store[0];
    }
}

/****** check link expiration  *******/
if (!function_exists('checkLinkExpiration')) {
    function checkLinkExpiration($request)
    {
        // check link expiration
        if ($request->filled('order_id')) {
            try {
                $order_id = Crypt::decryptString($request->order_id);
                $order = Orders::find($order_id);


                // check order existance
                if (!$order) {
                    return abort(404);
                }
                // check replied or not
                if ($order->replied) {
                    return abort(419);
                }
                return $order;
            } catch (\Illuminate\Contracts\Encryption\DecryptException $e) {
                return abort(404);
            }
        }
        return false;
    }
}

/********** get currency symbol ******/
if (!function_exists('getCurrencySymbol')) {
    function getCurrencySymbol($currency_code)
    {
        $currencies = array(
            "GBP" => "£",
            "USD" => "$",
            "EUR" => "€",
            "TRY" => "₺",
            "JPY" => "¥",
            "AUD" => "$",
            "CAD" => "$"
        );
        if (isset($currencies[$currency_code])) {
            return $currencies[$currency_code];
        }
        return $currency_code;
    }
}

/****** sending mail ******/

if (!function_exists('sendMail')) {
    function sendMail($to, $subject, $view, $data = [], $from = 'Vidial')
    {
        $mgClient = Mailgun::create(
            env('MAILGUN_SECRET'), // Mailgun API Key
            env('MAILGUN_ENDPOINT')
        );
        $domain = env('MAILGUN_DOMAIN');

        $html = view($view, $data)->render();

        $params = [
            'from' => $from . " < " . env('MAIL_USERNAME') . " >",
            'to' => $to,
            'subject' => $subject,
            'html' => $html,
        ];

        return $mgClient->messages()->send($domain, $params);
    }
}

if (!function_exists('emailLanguageConverter')) {
    function emailLanguageConverter($locale, $user_id)
    {

        $user = User::with('settings')->find($user_id);
        saveEnLanguage($locale, $user_id, $user);
    }
}

if (!function_exists('saveEnLanguage')) {
    function saveEnLanguage($locale, $user_id, $user)
    {
        if ($locale == 'en') {
            $Eng = array(
                array(
                    'user_id' => $user_id,
                    'subject' => "Here's your " . getCurrencySymbol($user->store_currency) . $user->settings->store_credit . " discount code for " . $user->store_name,
                    'type' => 'UGC_Approved',
                    'body' => '<p><h1>Hello {{name}}! Here is your {{amount}} Gift Card!</h1></p>
          <p><br>Hey, Congratulations, Your video for {{storename}} has been approved!</p>
          <p><br>We are constantly inspired by the creativity and passion of our customers, and we appreciate your support.</p>
          <p><br>Here is your Discount :{{discount_code}}</p>
          <br>{{button}}
           <p><br>Cheers!<br>{{storename}} Team</p>',
                    'btn_text' => 'Shop Now',
                    'btn_color' => '#000000',
                    'from' => 'Vidial'
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Win a " . getCurrencySymbol($user->store_currency) . $user->settings->store_credit . " gift card from " . $user->store_name,
                    'type' => 'Post_Purchase',
                    'body' => "<p><h1>Win a {{amount}} gift card by sharing your experience with us!</h1></p>
<p><br>Hello {{name}}, <br>Thank you for your previous order.</p>
<p><br>The feedback of our customers about our products is extremely valuable to us.</p>
<p>That's why we would like to offer you a {{amount}} gift card to our store in exchange for a video where you share your opinion about our products.</p>
<br>{{button}}
<br>
<p> We truly appreciate hearing our customers' feedback about our brand because satisfying you is our top priority.</p>
<br>{{storename}} Team",
                    'btn_text' => 'Get my gift card',
                    'btn_color' => '#000000',
                    'from' => 'Vidial'
                ),
                array(
                    'user_id' => $user_id,
                    'subject' => "Message for your Video about " . $user->store_name,

                    'type' => 'UGC_Declined',
                    'body' => "<p><h1>Update on your Video for {{storename}}</h1></p>
<p><br>Sorry, Your video for {{storename}} was not approved for the following reason:</p>
{{reason_decline}}
<br><p>No worries, you can try again if you want!</p>
<br>{{button}}
<br>Cheers,<br>{{storename}} Team",
                    'btn_text' => 'Get my Gift Card',
                    'btn_color' => '#000000',
                    'from' => 'Vidial'
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Share your feedback and receive " . getCurrencySymbol($user->store_currency) . $user->settings->store_credit . " from " . $user->store_name,
                    'type' => 'Reminder',
                    'body' => "<p><h1>Share your feedback to win a {{amount}} gift card</h1></p>
<p><br>Hey {{name}}, <br>We'd love to hear about your recent shopping experience at {{storename}}.</p>
<p>The feedback of our customers about our products is extremely valuable to us.</p>
<br><p>Simply record a quick 30-second video sharing your thoughts about our products, and we will reward you with a {{amount}} gift card as a thank you.</p>
<br>{{button}}
<br>
<p>Thank you for your trust and your loyalty,</p>
<br>Cheers,<br>{{storename}} Team",
                    'btn_text' => 'Leave a video review',
                    'btn_color' => '#000000',
                    'from' => 'Vidial'
                )
            );

            foreach ($Eng as $lang) {
                EmailTemplate::updateOrCreate(
                    ['user_id' => $user_id, 'type' => $lang['type']],
                    $lang
                );
            }
        }

        /**** French ******/
        if ($locale == 'fr') {
            $fr = array(
                array(
                    'user_id' => $user_id,
                    'subject' => "Voici votre Code de Réduction de " . getCurrencySymbol($user->store_currency) . $user->settings->store_credit . " pour " . $user->store_name,
                    'type' => 'UGC_Approved',
                    'body' => "<p><h1>Voici votre carte cadeau de {{amount}} !</h1></p>
                    <p><br>Félicitations ! Votre vidéo pour {{storename}} a été approuvée !</p>
          <p><br>Nous sommes constamment inspirés par la créativité et la passion de nos clients, et nous apprécions votre soutien.</p>
          <p><br>Voici votre code de réduction :<br>{{discount_code}}</p>
          <p>Vous pouvez utiliser ce code lors du paiement pour bénéficier de votre réduction.</p>
          <br>{{button}}
           <p><br>Cordialement<br>L'équipe de {{storename}}.</p>",
                    'btn_text' => 'Profiter du code de réduction',
                    'btn_color' => '#000000',
                    'from' => 'Vidial'
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Gagnez une carte-cadeau de " . getCurrencySymbol($user->store_currency) . $user->settings->store_credit . " sur  " . $user->store_name,
                    'type' => 'Post_Purchase',
                    'body' => "<p><h1>Gagnez une carte cadeau de {{amount}} en partageant votre expérience avec nous !</h1></p>
<p><br>Bonjour {{name}},</p>
<p><br>Nous vous remercions encore pour votre commande.</p>
<p><br>Les avis des clients sur nos produits sont extrêmement importants pour nous.</p>

<p> C'est pourquoi nous aimerions vous offrir une carte cadeau de {{amount}} à utiliser sur notre boutique en échange d'une vidéo dans laquelle vous partagez votre avis sur nos produits</p>
<br>{{button}}
<br><p>Nous apprécions vraiment d'entendre les commentaires de nos clients sur notre marque, car votre satisfaction est notre priorité absolue.</p>
Cordialement, 
<br>
L'équipe de {{storename}}.",
                    'btn_text' => 'Obtenir ma Carte Cadeau',
                    'btn_color' => '#000000',
                    'from' => 'Vidial'
                ),
                array(
                    'user_id' => $user_id,
                    'subject' => "Message pour votre vidéo à propos de " . $user->store_name,
                    'type' => 'UGC_Declined',
                    'body' => "<p><h1>Message concernant votre vidéo pour {{storename}}</h1></p>
<p><br>Désolé, mais votre vidéo pour {{storename}} n'a pas été approuvée pour la raison suivante :</p>
<br>
{{reason_decline}}
<br><p>Ne vous en faites pas, vous pouvez essayer à nouveau si vous le souhaitez !</p>
<br>
{{button}}
<br>Cordialement,
<br>
L'équipe {{storename}}.",
                    'btn_text' => 'Recommencer une vidéo',
                    'btn_color' => '#000000',
                    'from' => 'Vidial'
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Donnez votre avis et recevez " . getCurrencySymbol($user->store_currency) . $user->settings->store_credit . " de " . $user->store_name,
                    'type' => 'Reminder',
                    'body' => "<p><h1>Partagez-nous votre avis pour gagner une carte cadeau de {{amount}} !</h1></p>
<p><br>Bonjour,{{name}}</p>
<p><br>Nous aimerions beaucoup connaître votre expérience d'achat chez {{storename}}.</p>
<p><br>II vous suffit d'enregistrer une courte vidéo de quelques secondes pour partager vos impressions sur nos produits et nous vous récompenserons avec une carte cadeau de {{amount}} en guise de remerciement.</p>
<br>{{button}}
<p><br>Merci pour votre confiance et votre fidélité.</p>
<br>Cordialement,
<br>
L'équipe {{storename}}.",
                    'btn_text' => 'Laissez un avis vidéo',
                    'btn_color' => '#000000',
                    'from' => 'Vidial'
                )
            );

            foreach ($fr as $lang) {
                EmailTemplate::updateOrCreate(
                    ['user_id' => $user_id, 'type' => $lang['type']],
                    $lang
                );
            }
        }


        /*** German ***/

        if ($locale == 'de') {
            $de = array(
                array(
                    'user_id' => $user_id,
                    'subject' => "Hier ist Ihr " . getCurrencySymbol($user->store_currency) . $user->settings->store_credit . " Rabattcode für " . $user->store_name,
                    'type' => 'UGC_Approved',
                    'body' => '<p><h1>Hallo {{name}}! Hier ist Ihre Geschenkkarte im Wert von {{amount}}!</h1></p>
          <p><br>Herzlichen Glückwunsch! Ihr Video für {{storename}} wurde genehmigt!</p>
          <p><br>Wir sind ständig von der Kreativität und Leidenschaft unserer Kunden inspiriert und wir schätzen Ihre Unterstützung.</p>
          <p><br>Hier ist Ihr Rabattcode:<br>{{discount_code}}</p>
          <p><br>Sie können diesen Code beim Bezahlen verwenden, um Ihren Rabatt zu erhalten.</p>
          <br>{{button}}
           <p><br>Prost!<br>Das Team von {{storename}}.</p>',
                    'btn_text' => 'Jetzt einkaufen',
                    'btn_color' => '#000000',
                    'from' => 'Vidial'
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Gewinnen Sie eine Geschenkkarte im Wert von " . getCurrencySymbol($user->store_currency) . $user->settings->store_credit . " für " . $user->store_name,
                    'type' => 'Post_Purchase',
                    'body' => "<p><h1>Gewinnen Sie eine Geschenkkarte im Wert von {{amount}}, indem Sie Ihre Erfahrungen mit uns teilen!</h1></p>
<p><br>Guten Tag!{{name}}, <br>Wir bedanken uns nochmals für Ihre Bestellung.</p>
<p><br>The feedback of our customers about our products is extremely valuable to us.</p>
<p>Die Kundenbewertungen unserer Produkte sind für uns äußerst wichtig.</p>
<p><br>Deshalb möchten wir Ihnen eine Geschenkkarte im Wert von {{amount}} für unseren Shop anbieten, wenn Sie uns ein Video zur Verfügung stellen, in dem Sie Ihre Meinung zu unseren Produkten teilen.</p>
<br>{{button}}
<br>
<p>Es ist uns wirklich wichtig, das Feedback unserer Kunden zu unserer Marke zu hören, da Ihre Zufriedenheit für uns höchste Priorität hat</p>
<br>Mit freundlichen Grüßen,

Das {{storename}} Team.",
                    'btn_text' => 'Meine Geschenkkarte erhalten',
                    'btn_color' => '#000000'
                ),
                array(
                    'user_id' => $user_id,
                    'subject' => "Nachricht für Ihr Video über " . $user->store_name,
                    'type' => 'UGC_Declined',
                    'body' => "<p><h1>Nachricht bezüglich Ihres Videos für {{storename}}</h1></p>
<p><br>Entschuldigung, Ihr Video für {{storename}} wurde aus folgendem Grund nicht genehmigt:</p>
<br>{{reason_decline}}
<br><p>Keine Sorge, Sie können es erneut versuchen, wenn Sie möchten!</p>
<br>{{button}}
<p><br>Freundliche Grüße,<br>Das {{storename}}-Team.</p>
",
                    'btn_text' => 'Holen Sie sich meine Geschenkkarte',
                    'btn_color' => '#000000',
                    'from' => 'Vidial'
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Teilen Sie Ihr Feedback und erhalten Sie " . getCurrencySymbol($user->store_currency) . $user->settings->store_credit . " von " . $user->store_name,
                    'type' => 'Reminder',
                    'body' => "<p><h1>Teilen Sie uns Ihre Meinung mit und gewinnen Sie eine Geschenkkarte im Wert von {{amount}} !</h1></p>
<p><br>Hallo, Wir würden uns freuen, Ihre Einkaufserfahrung bei {{storename}} kennenzulernen.</p>
<p><br>Sie können einfach ein kurzes 30-Sekunden-Video aufnehmen, in dem Sie Ihre Gedanken zu unseren Produkten teilen, und wir belohnen Sie mit einer Geschenkkarte im Wert von {{amount}} als Dankeschön.</p>
<br>{{button}}
<p><br>Freundliche Grüße,<br>Das {{storename}}-Team.</p>",
                    'btn_text' => 'Ein Video-Review hinterlassen',
                    'btn_color' => '#000000',
                    'from' => 'Vidial'
                )
            );

            foreach ($de as $lang) {
                EmailTemplate::updateOrCreate(
                    ['user_id' => $user_id, 'type' => $lang['type']],
                    $lang
                );
            }
        }

        /**** Spanish ***/

        if ($locale == 'es') {
            $sp = array(
                array(
                    'user_id' => $user_id,
                    'subject' => "Aquí está su código de descuento de " . getCurrencySymbol($user->store_currency) . $user->settings->store_credit . " para " . $user->store_name,
                    'type' => 'UGC_Approved',
                    'body' => '<p><h1>¡Hola {{name}}! ¡Aquí está tu tarjeta de regalo de {{amount}}!</h1></p>
          <p><br>¡Felicidades! ¡Tu video para {{storename}} ha sido aprobado!</p>
          <p><br>Nos inspiramos constantemente en la creatividad y pasión de nuestros clientes, y apreciamos tu apoyo.</p>
          <p><br>Aquí está tu descuento : <br>{{discount_code}}</p>
          <p><br>Puedes usar este código al momento de pagar para recibir tu descuento.</p>
          <br>{{button}}
           <p><br>¡Saludos!<br>El equipo de {{storename}}.</p>',
                    'btn_text' => 'Comprar ahora',
                    'btn_color' => '#000000',
                    'from' => 'Vidial'
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Gana una tarjeta de regalo de " . getCurrencySymbol($user->store_currency) . $user->settings->store_credit . " para " . $user->store_name,
                    'type' => 'Post_Purchase',
                    'body' => "<p><h1>¡Gana una tarjeta de regalo de {{amount}} compartiendo tu experiencia con nosotros!</h1></p>
<p><br>¡Hola! {{name}}, <br>Gracias de nuevo por tu pedido.</p>
<p><br>Las opiniones de los clientes sobre nuestros productos son extremadamente importantes para nosotros.</p>
<p><br>Por eso nos gustaría ofrecerte una tarjeta de regalo de {{amount}} para nuestra tienda a cambio de un video en el que compartas tu opinión sobre nuestros productos</p>
<br>{{button}}
<br>
<p>Realmente apreciamos escuchar los comentarios de nuestros clientes sobre nuestra marca, ya que tu satisfacción es nuestra principal prioridad.</p>
<br>Atentamente,
<br>El equipo de {{storename}}.",
                    'btn_text' => 'Obtener mi tarjeta de regalo',
                    'btn_color' => '#000000',
                    'from' => 'Vidial'
                ),
                array(
                    'user_id' => $user_id,
                    'subject' => "Mensaje para su video sobre " . $user->store_name,
                    'type' => 'UGC_Declined',
                    'body' => "<p><h1>Actualización sobre su video para {{storename}}</h1></p>
<p><br>Lo siento, su video para {{storename}} no fue aprobado por la siguiente razón: <br></p>
{{reason_decline}}
<br><p>¡No se preocupe, puede intentarlo de nuevo si lo desea!</p>
<br>{{button}}
<br>¡Saludos!<br>
El equipo de {{storename}}.",
                    'btn_text' => 'Obtener mi tarjeta de regalo',
                    'btn_color' => '#000000',
                    'from' => 'Vidial'
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Comparte tus comentarios y recibe " . getCurrencySymbol($user->store_currency) . $user->settings->store_credit . " de " . $user->store_name,
                    'type' => 'Reminder',
                    'body' => "<p><h1>¡Comparta su opinión para ganar una tarjeta de regalo de {{amount}}!</h1></p>
<p><br>Hola,
,<br> Nos encantaría conocer su experiencia de compra en {{storename}}.</p>
<p><br>Simplemente grabe un breve video de unos pocos segundos compartiendo sus opiniones sobre nuestros productos y lo recompensaremos con una tarjeta de regalo de $&nbsp;{{amount}} como agradecimiento.</p>
<br>{{button}}
<br>Gracias por su confianza y lealtad <br> Saludos cordiales,Equipo {{storename}}.",
                    'btn_text' => 'Deja un comentario en video',
                    'btn_color' => '#000000',
                    'from' => 'Vidial'
                )
            );

            foreach ($sp as $lang) {
                EmailTemplate::updateOrCreate(
                    ['user_id' => $user_id, 'type' => $lang['type']],
                    $lang
                );
            }
        }

        /*** Portuguese ***/
        if ($locale == 'pt') {
            $portu = array(
                array(
                    'user_id' => $user_id,
                    'subject' => "Aqui está seu código de desconto de " . getCurrencySymbol($user->store_currency) . $user->settings->store_credit . " para " . $user->store_name,
                    'type' => 'UGC_Approved',
                    'body' => '<p><h1>Olá {{name}}! Aqui está o seu Cartão de Presente de {{amount}}!</h1></p>
          <p><br>Parabéns! Seu vídeo para {{storename}} foi aprovado!</p>
          <p><br>Somos constantemente inspirados pela criatividade e paixão dos nossos clientes, e apreciamos o seu apoio.</p>
          <p><br>Aqui está o seu desconto :<br>{{discount_code}}</p>
          <p><br>Você pode usar este código ao finalizar a compra para receber o desconto.</p>
          <br>{{button}}
           <p><br>Saudações!<br>Equipe {{storename}}.</p>',
                    'btn_text' => 'Comprar agora',
                    'btn_color' => '#000000',
                    'from' => 'Vidial'
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Ganhe um cartão-presente de " . getCurrencySymbol($user->store_currency) . $user->settings->store_credit . " para " . $user->store_name,
                    'type' => 'Post_Purchase',
                    'body' => "<p><h1>Ganhe um cartão presente de {{amount}} compartilhando sua experiência conosco!</h1></p>
<p><br>Olá! {{name}}, <br>Agradecemos novamente pelo seu pedido.</p>
<p><br>As opiniões dos clientes sobre nossos produtos são extremamente importantes para nós.</p>
<p>Por isso, gostaríamos de oferecer um cartão presente de {{amount}} para nossa loja em troca de um vídeo onde você compartilha sua opinião sobre nossos produtos</p>
{{button}}
<br>
<p>Realmente valorizamos os comentários de nossos clientes sobre nossa marca, pois sua satisfação é nossa principal prioridade</p>
<br>Atenciosamente,<br>Equipe {{storename}}.",
                    'btn_text' => 'Obter meu cartão presente',
                    'btn_color' => '#000000',
                    'from' => 'Vidial'
                ),
                array(
                    'user_id' => $user_id,
                    'subject' => "Mensagem para seu vídeo sobre " . $user->store_name,
                    'type' => 'UGC_Declined',
                    'body' => "<p><h1>Atualização sobre o seu vídeo para {{storename}}</h1></p>
<p><br>Desculpe, o seu vídeo para {{storename}} não foi aprovado por causa do seguinte motivo:</p>
{{reason_decline}}
<br><p>Não se preocupe, você pode tentar novamente se quiser!</p>
<br>{{button}}
<br>Atenciosamente,
<br>Equipe{{storename}}",
                    'btn_text' => 'Obter meu cartão-presente',
                    'btn_color' => '#000000',
                    'from' => 'Vidial'
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Compartilhe seus comentários e receba " . getCurrencySymbol($user->store_currency) . $user->settings->store_credit . " de " . $user->store_name,
                    'type' => 'Reminder',
                    'body' => "<p><h1>Compartilhe sua opinião e ganhe um vale-presente de {{amount}}!</h1></p>
<p><br>Olá, Adoraríamos saber sobre sua experiência de compras recente na {{storename}}</p>
<p><br>Basta gravar um vídeo curto de alguns segundos compartilhando seus pensamentos sobre nossos produtos e recompensaremos você com um vale-presente de {{amount}} como agradecimento.</p>
<br>{{button}}
<p><br>Agradecemos pela sua confiança e fidelidade,</p>
<br>Atenciosamente<br>Equipe {{storename}}.",
                    'btn_text' => 'Deixe uma avaliação em vídeo',
                    'btn_color' => '#000000',
                    'from' => 'Vidial'
                )
            );

            foreach ($portu as $lang) {
                EmailTemplate::updateOrCreate(
                    ['user_id' => $user_id, 'type' => $lang['type']],
                    $lang
                );
            }
        }

        /**** Italian ***/
        if ($locale == 'it') {
            $it = array(
                array(
                    'user_id' => $user_id,
                    'subject' => "Ecco il tuo codice sconto di " . getCurrencySymbol($user->store_currency) . $user->settings->store_credit . " per " . $user->store_name,
                    'type' => 'UGC_Approved',
                    'body' => '<p><h1>Ciao {{name}}! Ecco la tua Carta Regalo di {{amount}}!</h1></p>
          <p><br>Congratulazioni! Il tuo video per {{storename}} è stato approvato!</p>
          <p><br>Siamo costantemente ispirati dalla creatività e dalla passione dei nostri clienti e apprezziamo il tuo sostegno.</p>
          <p><br>Ecco il tuo sconto: <br>{{discount_code}}</p>
          <p><br>Puoi utilizzare questo codice al momento del pagamento per ricevere lo sconto.<p/>
          <br>{{button}}

           <p><br>Saluti!<br>Il team di {{storename}}.</p>',
                    'btn_text' => 'Acquista ora',
                    'btn_color' => '#000000',
                    'from' => 'Vidial'
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Vinci una carta regalo da " . getCurrencySymbol($user->store_currency) . $user->settings->store_credit . " per " . $user->store_name,
                    'type' => 'Post_Purchase',
                    'body' => "<p><h1>Vinci una carta regalo di {{amount}} condividendo la tua esperienza con noi!</h1></p>
<p><br>Ciao! {{name}}, <br>Grazie ancora per il tuo ordine.</p>
<p><br>Le opinioni dei clienti sui nostri prodotti sono estremamente importanti per noi.</p>
<p>Per questo motivo, vorremmo offrirti una carta regalo di {{amount}} da utilizzare nel nostro negozio in cambio di un video in cui condividi la tua opinione sui nostri prodotti.</p>
{{button}}
<br>
<p>Apprezziamo molto sentire i commenti dei nostri clienti sulla nostra marca, poiché la tua soddisfazione è la nostra massima priorità.</p>
<br>Cordiali saluti,<br>Il team di {{store}}.",
                    'btn_text' => 'Ottieni la mia carta regalo',
                    'btn_color' => '#000000',
                    'from' => 'Vidial'
                ),
                array(
                    'user_id' => $user_id,
                    'subject' => "Messaggio per il tuo video su " . $user->store_name,
                    'type' => 'UGC_Declined',
                    'body' => "<p><h1>Aggiornamento sul tuo video per {{storename}}</h1></p>
<p><br>Spiacenti, il tuo video per {{storename}} non è stato approvato per il seguente motivo:</p>
<br>{{reason_decline}}
<br><p>Non ti preoccupare, puoi provare di nuovo se vuoi!</p>
<br>{{button}}<br>
<br>Saluti,<br>Il team di {{storename}}.",
                    'btn_text' => 'Ottieni la mia carta regalo',
                    'btn_color' => '#000000',
                    'from' => 'Vidial'
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Condividi i tuoi commenti e ricevi " . getCurrencySymbol($user->store_currency) . $user->settings->store_credit . " da " . $user->store_name,
                    'type' => 'Reminder',
                    'body' => "<p><h1>Condividi la tua opinione per vincere una carta regalo di {{amount}}!</h1></p>
<p><br>Ciao, Ci piacerebbe sapere della tua recente esperienza di acquisto su {{storename}}.</p>
<p><br>Registrati semplicemente in un breve video di 30 secondi condividendo i tuoi pensieri sui nostri prodotti e ti premieremo con una carta regalo di {{amount}} come ringraziamento. </p>
<br>{{button}}<br>
<br><p>Grazie per la tua fiducia e la tua fedeltà,</p>
<br>Saluti,II team di {{storename}}.",
                    'btn_text' => 'Lascia una recensione video',
                    'btn_color' => '#000000',
                    'from' => 'Vidial'
                )
            );

            foreach ($it as $lang) {
                EmailTemplate::updateOrCreate(
                    ['user_id' => $user_id, 'type' => $lang['type']],
                    $lang
                );
            }
        }

        return;




        /********* for post purchase ****/
    }
}
