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
                    'subject' => "Here's your {{amount}} discount code for {{storename}}",
                    'type' => 'UGC_Approved',
                    'body' => '
<p>Hey {{name}}, <br>Congratulations, Your video for {{storename}} has been approved!</p>
<p>We are constantly inspired by the creativity and passion of our customers, and we appreciate your support.</p>
<p>Here is your Discount:<br><br>{{discount_code}}<br><br>{{button}}<br><br>Cheers!<br>{{storename}} Team</p>',
                    'btn_text' => 'Shop Now',
                    'btn_color' => '#000000',
                    'from'=>auth()->user()->store_name,
                    'logo'=>''
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Win a {{amount}} gift card from {{storename}}",
                    'type' => 'Post_Purchase',
                    'body' => "
<p>Hello {{name}}, <br>Thank you for your previous order.<br><br>The feedback of our customers about our products is extremely valuable to us.</p>
<p>That's why we would like to offer you a {{amount}} gift card to our store in exchange for a video where you share your opinion about our products.<br><br>{{button}} </p>
<p>We truly appreciate hearing our customers' feedback about our brand because satisfying you is our top priority.<br><br>{{storename}} Team</p>",
                    'btn_text' => 'Get my gift card',
                    'btn_color' => '#000000',
                    'from'=>auth()->user()->store_name,
                    'logo' => ''
                ),
                array(
                    'user_id' => $user_id,
                    'subject' => "Message for your Video about {{storename}}",

                    'type' => 'UGC_Declined',
                    'body' => "
<p>Sorry, Your video for {{storename}} was not approved for the following reason:<br><br>{{reason_decline}}<br><br>No worries, you can try again if you want!<br><br>{{button}} <br><br>Cheers,<br>{{storename}} Team</p>",
                    'btn_text' => 'Get my Gift Card',
                    'btn_color' => '#000000',
                    'from'=>auth()->user()->store_name,
                    'logo' => ''
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Share your feedback and receive {{amount}} from {{storename}}",
                    'type' => 'Reminder',
                    'body' => "
<p>Hey {{name}}, <br>We'd love to hear about your recent shopping experience at {{storename}}.<br><br>The feedback of our customers about our products is extremely valuable to us.<br><br>Simply record a quick 30-second video sharing your thoughts about our products, and we will reward you with a {{amount}} gift card as a thank you.<br><br>{{button}}<br><br>Thank you for your trust and your loyalty,<br><br>Cheers,<br>{{storename}} Team</p>",
                    'btn_text' => 'Leave a video review',
                    'btn_color' => '#000000',
                    'from'=>auth()->user()->store_name,
                    'logo' => ''
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
                    'subject' => "Voici votre Code de Réduction de {{amount}} pour {{storename}}",
                    'type' => 'UGC_Approved',
                    'body' => "
<p>F&eacute;licitations {{name}}! Votre vid&eacute;o pour {{storename}} a &eacute;t&eacute; approuv&eacute;e!<br><br>Nous sommes constamment inspir&eacute;s par la cr&eacute;ativit&eacute; et la passion de nos clients, et nous appr&eacute;cions votre soutien.<br><br>Voici votre code de r&eacute;duction:<br><br>{{discount_code}}<br><br>Vous pouvez utiliser ce code lors du paiement pour b&eacute;n&eacute;ficier de votre r&eacute;duction.<br><br>{{button}}<br><br>Cordialement,<br>L'&eacute;quipe de {{storename}}</p>",
                    'btn_text' => 'Profiter du code de réduction',
                    'btn_color' => '#000000',
                    'from'=>auth()->user()->store_name,
                    'logo' => ''
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Gagnez une carte-cadeau de {{amount}} sur {{storename}}",
                    'type' => 'Post_Purchase',
                    'body' => "
<p>Bonjour {{name}},<br>Nous vous remercions encore pour votre commande.<br><br>Les avis des clients sur nos produits sont extr&ecirc;mement importants pour nous.</p>
<p>C'est pourquoi nous aimerions vous offrir une carte cadeau de {{amount}} &agrave; utiliser sur notre boutique en &eacute;change d'une vid&eacute;o dans laquelle vous partagez votre avis sur nos produits<br><br>{{button}}<br><br>Nous appr&eacute;cions vraiment d'entendre les commentaires de nos clients sur notre marque, car votre satisfaction est notre priorit&eacute; absolue.<br><br>Cordialement, <br>L'&eacute;quipe de {{storename}}</p>",
                    'btn_text' => 'Obtenir ma Carte Cadeau',
                    'btn_color' => '#000000',
                    'from'=>auth()->user()->store_name,
                    'logo' => ''
                ),
                array(
                    'user_id' => $user_id,
                    'subject' => "Message pour votre vidéo à propos de {{storename}}",
                    'type' => 'UGC_Declined',
                    'body' => "<p>D&eacute;sol&eacute;, mais votre vid&eacute;o pour {{storename}} n'a pas &eacute;t&eacute; approuv&eacute;e pour la raison suivante:<br><br>{{reason_decline}} <br><br>Ne vous en faites pas, vous pouvez essayer &agrave; nouveau si vous le souhaitez!<br><br>{{button}}&nbsp;<br><br>Cordialement, <br>L'&eacute;quipe {{storename}}</p>",
                    'btn_text' => 'Recommencer une vidéo',
                    'btn_color' => '#000000',
                    'from'=>auth()->user()->store_name,
                    'logo' => ''
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Donnez votre avis et recevez {{amount}} de {{storename}}",
                    'type' => 'Reminder',
                    'body' => "<p>Bonjour {{name}},<br>Nous aimerions beaucoup conna&icirc;tre votre exp&eacute;rience d'achat chez {{storename}}.<br><br>II vous suffit d'enregistrer une courte vid&eacute;o de quelques secondes pour partager vos impressions sur nos produits et nous vous r&eacute;compenserons avec une carte cadeau de {{amount}} en guise de remerciement.<br><br>{{button}}<br><br>Merci pour votre confiance et votre fid&eacute;lit&eacute;.<br><br>Cordialement,&nbsp;<br>L'&eacute;quipe {{storename}}</p>",
                    'btn_text' => 'Laissez un avis vidéo',
                    'btn_color' => '#000000',
                    'from'=>auth()->user()->store_name,
                    'logo' => ''
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
                    'subject' => "Hier ist Ihr {{amount}} Rabattcode für {{storename}}",
                    'type' => 'UGC_Approved',
                    'body' => '
<p>Herzlichen Gl&uuml;ckwunsch!<br>Ihr Video f&uuml;r {{storename}} wurde genehmigt!<br><br>Wir sind st&auml;ndig von der Kreativit&auml;t und Leidenschaft unserer Kunden inspiriert und wir sch&auml;tzen Ihre Unterst&uuml;tzung.<br><br>Hier ist Ihr Rabattcode:<br><br>{{discount_code}}<br><br>Sie k&ouml;nnen diesen Code beim Bezahlen verwenden, um Ihren Rabatt zu erhalten.<br><br>{{button}}<br><br>Prost!<br>Das Team von {{storename}}</p>',
                    'btn_text' => 'Jetzt einkaufen',
                    'btn_color' => '#000000',
                    'from'=>auth()->user()->store_name,
                    'logo' => ''
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Gewinnen Sie eine Geschenkkarte im Wert von {{amount}} für {{storename}}",
                    'type' => 'Post_Purchase',
                    'body' => "<p>Guten Tag {{name}}! <br>Wir bedanken uns nochmals f&uuml;r Ihre Bestellung.<br><br>The feedback of our customers about our products is extremely valuable to us.<br><br>Die Kundenbewertungen unserer Produkte sind f&uuml;r uns &auml;u&szlig;erst wichtig.<br><br>Deshalb m&ouml;chten wir Ihnen eine Geschenkkarte im Wert von {{amount}} f&uuml;r unseren Shop anbieten, wenn Sie uns ein Video zur Verf&uuml;gung stellen, in dem Sie Ihre Meinung zu unseren Produkten teilen.<br><br>{{button}}<br><br>Es ist uns wirklich wichtig, das Feedback unserer Kunden zu unserer Marke zu h&ouml;ren, da Ihre Zufriedenheit f&uuml;r uns h&ouml;chste Priorit&auml;t hat.<br><br>Mit freundlichen Gr&uuml;&szlig;en,<br>Das {{storename}} Team</p>",
                    'btn_text' => 'Meine Geschenkkarte erhalten',
                    'btn_color' => '#000000',
                    'logo' => ''
                ),
                array(
                    'user_id' => $user_id,
                    'subject' => "Nachricht für Ihr Video über {{storename}}" ,
                    'type' => 'UGC_Declined',
                    'body' => "
<p>Entschuldigung, Ihr Video f&uuml;r {{storename}} wurde aus folgendem Grund nicht genehmigt:<br><br>{{reason_decline}} <br><br>Keine Sorge, Sie k&ouml;nnen es erneut versuchen, wenn Sie m&ouml;chten!<br><br>{{button}}<br><br>Freundliche Gr&uuml;&szlig;e,<br>Das {{storename}} Team</p>
",
                    'btn_text' => 'Holen Sie sich meine Geschenkkarte',
                    'btn_color' => '#000000',
                    'from'=>auth()->user()->store_name,
                    'logo' => ''
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Teilen Sie Ihr Feedback und erhalten Sie {{amount}} von {{storename}}" ,
                    'type' => 'Reminder',
                    'body' => "
<p>Hallo {{name}},<br>Wir w&uuml;rden uns freuen, Ihre Einkaufserfahrung bei {{storename}} kennenzulernen.<br><br>Sie k&ouml;nnen einfach ein kurzes 30-Sekunden-Video aufnehmen, in dem Sie Ihre Gedanken zu unseren Produkten teilen, und wir belohnen Sie mit einer Geschenkkarte im Wert von {{amount}} als Dankesch&ouml;n.<br><br>{{button}}<br><br>Freundliche Gr&uuml;&szlig;e,<br>Das {{storename}} Team</p>",
                    'btn_text' => 'Ein Video-Review hinterlassen',
                    'btn_color' => '#000000',
                    'from'=>auth()->user()->store_name,
                    'logo' => ''
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
                    'subject' => "Aquí está su código de descuento de {{amount}} para {{storename}}" ,
                    'type' => 'UGC_Approved',
                    'body' => '
<p>&iexcl;Felicidades! &iexcl;Tu video para {{storename}} ha sido aprobado!<br><br>Nos inspiramos constantemente en la creatividad y pasi&oacute;n de nuestros clientes, y apreciamos tu apoyo.<br><br>Aqu&iacute; est&aacute; tu descuento:&nbsp;<br><br>{{discount_code}}<br><br>Puedes usar este c&oacute;digo al momento de pagar para recibir tu descuento.<br><br>{{button}}<br><br>&iexcl;Saludos!<br>El equipo de {{storename}}</p>',
                    'btn_text' => 'Comprar ahora',
                    'btn_color' => '#000000',
                    'from'=>auth()->user()->store_name,
                    'logo' => ''
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Gana una tarjeta de regalo de {{amount}} para {{storename}}" ,
                    'type' => 'Post_Purchase',
                    'body' => "
<p>&iexcl;Hola!&nbsp;<br>Gracias de nuevo por tu pedido.<br><br>Las opiniones de los clientes sobre nuestros productos son extremadamente importantes para nosotros.<br><br>Por eso nos gustar&iacute;a ofrecerte una tarjeta de regalo de {{amount}} para nuestra tienda a cambio de un video en el que compartas tu opini&oacute;n sobre nuestros productos<br><br>{{button}}<br><br>Realmente apreciamos escuchar los comentarios de nuestros clientes sobre nuestra marca, ya que tu satisfacci&oacute;n es nuestra principal prioridad.<br><br>Atentamente,&nbsp;<br>El equipo de {{storename}}</p>",
                    'btn_text' => 'Obtener mi tarjeta de regalo',
                    'btn_color' => '#000000',
                    'from'=>auth()->user()->store_name,
                    'logo' => ''
                ),
                array(
                    'user_id' => $user_id,
                    'subject' => "Mensaje para su video sobre {{storename}}" ,
                    'type' => 'UGC_Declined',
                    'body' => "
<p>Lo siento, su video para {{storename}} no fue aprobado por la siguiente raz&oacute;n:<br><br>{{reason_decline}}<br><br>&iexcl;No se preocupe, puede intentarlo de nuevo si lo desea!<br><br>{{button}}<br><br>&iexcl;Saludos!<br>El equipo de {{storename}}</p>",
                    'btn_text' => 'Obtener mi tarjeta de regalo',
                    'btn_color' => '#000000',
                    'from'=>auth()->user()->store_name,
                    'logo' => ''
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Comparte tus comentarios y recibe {{amount}} de {{storename}}" ,
                    'type' => 'Reminder',
                    'body' => "<p>Hola {{name}}, <br>Nos encantar&iacute;a conocer su experiencia de compra en {{storename}}.<br><br>Simplemente grabe un breve video de unos pocos segundos compartiendo sus opiniones sobre nuestros productos y lo recompensaremos con una tarjeta de regalo de {{amount}} como agradecimiento.<br><br>{{button}}&nbsp;<br><br>Gracias por su confianza y lealtad.<br><br>Saludos cordiales,<br>Equipo {{storename}}</p>",
                    'btn_text' => 'Deja un comentario en video',
                    'btn_color' => '#000000',
                    'from'=>auth()->user()->store_name,
                    'logo' => ''
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
                    'subject' => "Aqui está seu código de desconto de {{amount}} para {{storename}}",
                    'type' => 'UGC_Approved',
                    'body' => '<p>Parab&eacute;ns {{name}}! Seu v&iacute;deo para {{storename}} foi aprovado!<br><br>Somos constantemente inspirados pela criatividade e paix&atilde;o dos nossos clientes, e apreciamos o seu apoio.<br><br>Aqui est&aacute; o seu desconto:<br><br>{{discount_code}}<br><br>Voc&ecirc; pode usar este c&oacute;digo ao finalizar a compra para receber o desconto.<br><br>{{button}}<br><br>Sauda&ccedil;&otilde;es!<br>Equipe {{storename}}</p>',
                    'btn_text' => 'Comprar agora',
                    'btn_color' => '#000000',
                    'from'=>auth()->user()->store_name,
                    'logo' => ''
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Ganhe um cartão-presente de {{amount}} para {{storename}}" ,
                    'type' => 'Post_Purchase',
                    'body' => "
<p>Ol&aacute; {{name}}, <br>Agradecemos novamente pelo seu pedido.<br><br>As opini&otilde;es dos clientes sobre nossos produtos s&atilde;o extremamente importantes para n&oacute;s.<br><br>Por isso, gostar&iacute;amos de oferecer um cart&atilde;o presente de {{amount}} para nossa loja em troca de um v&iacute;deo onde voc&ecirc; compartilha sua opini&atilde;o sobre nossos produtos.<br><br>{{button}}<br><br>Realmente valorizamos os coment&aacute;rios de nossos clientes sobre nossa marca, pois sua satisfa&ccedil;&atilde;o &eacute; nossa principal prioridade.<br><br>Atenciosamente,<br>Equipe {{storename}}</p>",
                    'btn_text' => 'Obter meu cartão presente',
                    'btn_color' => '#000000',
                    'from'=>auth()->user()->store_name,
                    'logo' => ''
                ),
                array(
                    'user_id' => $user_id,
                    'subject' => "Mensagem para seu vídeo sobre {{storename}}",
                    'type' => 'UGC_Declined',
                    'body' => "<p>Desculpe, o seu v&iacute;deo para {{storename}} n&atilde;o foi aprovado por causa do seguinte motivo:<br><br>{{reason_decline}}<br><br>N&atilde;o se preocupe, voc&ecirc; pode tentar novamente se quiser!<br><br>{{button}} <br><br>Atenciosamente,<br>Equipe {{storename}}</p>",
                    'btn_text' => 'Obter meu cartão-presente',
                    'btn_color' => '#000000',
                    'from'=>auth()->user()->store_name,
                    'logo' => ''
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Compartilhe seus comentários e receba {{amount}} de {{storename}}",
                    'type' => 'Reminder',
                    'body' => "
<p>Ol&aacute; {{name}}, Adorar&iacute;amos saber sobre sua experi&ecirc;ncia de compras recente na {{storename}}.<br><br>Basta gravar um v&iacute;deo curto de alguns segundos compartilhando seus pensamentos sobre nossos produtos e recompensaremos voc&ecirc; com um vale-presente de {{amount}} como agradecimento.<br><br>{{button}}<br><br>Agradecemos pela sua confian&ccedil;a e fidelidade.<br><br>Atenciosamente,<br>Equipe {{storename}}</p>",
                    'btn_text' => 'Deixe uma avaliação em vídeo',
                    'btn_color' => '#000000',
                    'from'=>auth()->user()->store_name,
                    'logo' => ''
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
                    'subject' => "Ecco il tuo codice sconto di {{amount}} per {{storename}}",
                    'type' => 'UGC_Approved',
                    'body' => '
<p>Congratulazioni {{name}}! Il tuo video per {{storename}} &egrave; stato approvato!<br><br>Siamo costantemente ispirati dalla creativit&agrave; e dalla passione dei nostri clienti e apprezziamo il tuo sostegno.<br><br>Ecco il tuo sconto: <br><br>{{discount_code}}<br><br>Puoi utilizzare questo codice al momento del pagamento per ricevere lo sconto.<br><br>{{button}}<br><br>Saluti,<br>Il team di {{storename}}</p>',
                    'btn_text' => 'Acquista ora',
                    'btn_color' => '#000000',
                    'from'=>auth()->user()->store_name,
                    'logo' => ''
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Vinci una carta regalo da {{amount}} per {{storename}}",
                    'type' => 'Post_Purchase',
                    'body' => "
<p>Ciao {{name}}, <br>Grazie ancora per il tuo ordine.<br><br>Le opinioni dei clienti sui nostri prodotti sono estremamente importanti per noi.<br><br>Per questo motivo, vorremmo offrirti una carta regalo di {{amount}} da utilizzare nel nostro negozio in cambio di un video in cui condividi la tua opinione sui nostri prodotti.<br><br>{{button}}&nbsp;<br><br>Apprezziamo molto sentire i commenti dei nostri clienti sulla nostra marca, poich&eacute; la tua soddisfazione &egrave; la nostra massima priorit&agrave;.<br><br>Cordiali saluti,<br>Il team di {{storename}}</p>",
                    'btn_text' => 'Ottieni la mia carta regalo',
                    'btn_color' => '#000000',
                    'from'=>auth()->user()->store_name,
                    'logo' => ''
                ),
                array(
                    'user_id' => $user_id,
                    'subject' => "Messaggio per il tuo video su {{storename}}",
                    'type' => 'UGC_Declined',
                    'body' => "<p>Spiacenti, il tuo video per {{storename}} non &egrave; stato approvato per il seguente motivo:<br><br>{{reason_decline}}&nbsp;<br><br>Non ti preoccupare, puoi provare di nuovo se vuoi!<br><br>{{button}}<br><br>Saluti,<br>Il team di {{storename}}</p>",
                    'btn_text' => 'Ottieni la mia carta regalo',
                    'btn_color' => '#000000',
                    'from'=>auth()->user()->store_name,
                    'logo' => ''
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Condividi i tuoi commenti e ricevi {{amount}} da {{storename}}" ,
                    'type' => 'Reminder',
                    'body' => "
<p>Ciao {{name}}, Ci piacerebbe sapere della tua recente esperienza di acquisto su {{storename}}.<br><br>Registrati semplicemente in un breve video di 30 secondi condividendo i tuoi pensieri sui nostri prodotti e ti premieremo con una carta regalo di {{amount}} come ringraziamento.<br><br>{{button}}<br><br>Grazie per la tua fiducia e la tua fedelt&agrave;.<br><br>Saluti,<br>Il team di {{storename}}</p>",
                    'btn_text' => 'Lascia una recensione video',
                    'btn_color' => '#000000',
                    'from'=>auth()->user()->store_name,
                    'logo' => ''
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
