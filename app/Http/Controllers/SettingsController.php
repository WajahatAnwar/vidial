<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\Plan;
use App\Models\User;
use App\Models\Setting;
use Illuminate\Http\Request;
use App\Models\EmailTemplate;
use App\Models\EmailCredentials;
use App\Models\KlavioCredential;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Crypt;
use Carbon\Carbon;


class SettingsController extends Controller
{
    public $store = '';
    /**** Current User ******/

    public function __construct(Request $request)
    {
        if (isset($request->store) && $request->store !== '') {
            $this->store = $request->store;
        }
    }
    public function get_current_settings()
    {
        $current_user = Auth::user();
        $shop = User::find($current_user->id);

        $current_settings = Setting::where('user_id', $shop->id)->first();

        if (empty($current_settings)) {
            $current_settings = new Setting;
            $current_settings->user_id = $shop->id;
            $current_settings->save();
        }

        $current_settings = Setting::where('user_id', $shop->id)->first();

        return response()->json([
            'success' => true,
            'message' =>  "Current Settings Displayed",
            'data' => $current_settings,
        ]);
    }

    public function change_pop_up_type(Request $request)
    {
        // return $request;
        $current_user = Auth::user();
        $shop = User::find($current_user->id);

        $link = "";

        if ($request->pop_up_type == "client_gif") {

            $vbl3 = rand(100000000000000, 999999999999999);
            $vbl4 = File::extension($request->new_file->getClientOriginalName());
            request()->new_file->storeAs('public/uploaded_images', $vbl3 . "." . $vbl4);
        }


        $current_settings = Setting::where('user_id', $shop->id)->first();
        $current_settings->user_id = $shop->id;
        $current_settings->pop_up_type = $request->pop_up_type;

        if ($request->pop_up_type == "client_gif") {
            $current_settings->pop_up_data = "storage/uploaded_images/$vbl3.$vbl4";
            $link = "storage/uploaded_images/$vbl3.$vbl4";
        }

        $current_settings->save();

        return response()->json([
            'success' => true,
            'message' => "Pop Up Settings Changed",
            'data' => $link,
        ]);
    }
    /******* Get settings *****/
    public function getSettings(Request $request)
    {

        if ($request->filled('id')) {
            $user = User::find($request->id);
            if (!$user) {
                return redirect()->to('admin-dashboard');
            }
        } else {
            $user = Auth::user();
        }
        $data = Setting::where('user_id', $user->id)->first();
        $store = User::where('id', $user->id)->with('emailCreds', 'googleDriveCreds', 'klavio')->first();
        //$store=User::find(Auth::user()->id)->with('emailCreds');
        $emailCreds = $store->emailCreds;
        if ($data) {
            $data['instructions'] = json_decode($data['instructions']);
        }
        $plan = Plan::where('id', $store->plan_id)
            ->first();
        $data['store'] = $store->name;
        $data['email'] = $store->email;
        $data['store_name'] = $store->store_name;
        $data['btn_color'] = $data->page_color;
        $data['storeHandle'] = $store->store_handle ? $store->store_handle : $store->store_name;
        $data['store_currency'] = getCurrencySymbol($store->store_currency);
        $data['email_creds'] = $emailCreds;
        $data['gd_creds'] = $store->googleDriveCreds;
        $data['klavio'] = $store->klavio;
        $data['plan_id'] = $store->plan_id;
        $data['plan_name'] = $plan->name;
        return response()->json([
            'success' => true,
            'message' => "Settings get Successfully",
            'data' => $data
        ]);
    }
    /******* save settings *****/
    public function saveSettings(Request $request)
    {
        if ($request->filled('id')) {
            $user = User::find($request->id);
            if (!$user) {
                return redirect()->to('admin-dashboard');
            }
        } else {
            $user = Auth::user();
        }
        $fav_icon = null;
        $video = '';
        $image_mimes = '';
        $video_mimes = '';
        if ($request->file('logo')) {
            $image_mimes = '|mimes:jpg,jpeg,png';
        }
        if ($request->file('video')) {
            $video_mimes = '|mimetypes:video/quicktime,video/x-quicktime,video/mp4';
        }
        $validatedData = $request->validate([
            'store_credit' => 'required|numeric|min:1',
            'page_display_to_customers' => 'required|numeric|min:1',
            'email_sent_to_customer' => 'required|numeric|min:1',
            'page_link' => 'required|numeric|min:1',
            'instructions' => 'required',
            'email_sent_to_customer' => 'required|numeric|min:1',
            'logo' => $image_mimes,
            'video' => $video_mimes,
            'star_credit' => 'required|numeric|min:1',
        ]);
        if ($request->file('logo')) {
            $image = time() . '.' . $request->file('logo')->extension();
            $request->file('logo')->move(public_path('logo'), $image);
        } else {
            $image = $request->logo ?? 'undefined';
        }
        if ($request->file('video')) {
            $video = time() . '.' . $request->file('video')->extension();
            $request->file('video')->move(public_path('video'), $video);
        } else {
            $video = $request->video ?? '';
        }

        if ($request->file('fav_icon')) {
            $fav_icon = time() . '.' . $request->file('fav_icon')->extension();
            $request->file('fav_icon')->move(public_path('fav_icons'), $fav_icon);
        }
        $currentUser = $user->id;
        $previous_store_credit = '';
        $alreadySavedSettings = Setting::where('user_id', $currentUser)->first();
        if ($alreadySavedSettings) {
            $previous_store_credit = $alreadySavedSettings->store_credit;
        }
        $settings['store_credit'] = $request->store_credit;
        $settings['page_display_to_customers'] = $request->page_display_to_customers;
        $settings['email_sent_to_customer'] = $request->email_sent_to_customer;
        $settings['page_link'] = $request->page_link;
        $settings['instructions'] = $request->instructions;
        $settings['page_color'] = $request->page_color ?? '#FF5175';
        $settings['user_id'] = $currentUser;
        $settings['logo'] = $image;
        $settings['video'] = $video;
        $settings['email_status'] = $request->setting_status;

        $Instruction_field = $request->instruction_title ? str_replace($previous_store_credit, $request->store_credit, $request->instruction_title) : 'Instruction';

        $settings['instruction_title'] = $Instruction_field;
        $settings['locale'] = $request->locale ?? 'en';
        //$settings['dropzone_text'] = $request->dropzone_text;
        $settings['inspirational_video_title'] = $request->video_title;
        $settings['instruction_subtitle'] = $request->instruction_subtitle;
        $settings['video_btn_text'] = $request->video_btn_text;
        $settings['fav_icon'] = $fav_icon;
        $settings['star_credit'] = $request->star_credit;


        $language = Setting::where('user_id', $user->id)->first();
        if ($language->locale == $request->locale) {
        } else {
            emailLanguageConverter($request->locale, $currentUser);
        }
        Setting::updateOrCreate(['user_id' => $currentUser], $settings);


        return response()->json([
            'success' => true,
            'message' => "Settings saved Successfully",
        ]);
    }

    public function saveEmailTab(Request $request)
    {
        if ($request->filled('id')) {
            $currentUser = User::find($request->id);
            if (!$currentUser) {
                return redirect()->to('admin-dashboard');
            }
        } else {
            $currentUser = Auth::user();
        }

        $validatedData = $request->validate([
            'page_display_to_customers' => 'required|numeric|min:1',
            'email_sent_to_customer' => 'required|numeric|min:1',
            'page_link' => 'required|numeric|min:1',


        ]);




        $settings = Setting::where('user_id', $currentUser->id)->first();

        if ($settings) {

            $settings->page_display_to_customers = $request->page_display_to_customers;
            $settings->email_sent_to_customer = $request->email_sent_to_customer;
            $settings->page_link = $request->page_link;
            $settings->page_display_to_customers = $request->page_display_to_customers;
            $settings->email_status = $request->setting_status;
            $settings->save();
        }
        return response()->json([
            'success' => true,
            'message' => "Email Tab Saved Successfully",
        ]);
    }

    /****** Landing Page *******/
    public function landingPage(Request $request, $locale)
    {
        // Language Translation

        if ($this->store !== '') {

            $user = User::with('settings')->where('name', $this->store)->first();

            if (!$user || !$user->settings) {
                return abort(404);
            }
            setLan($user->settings->locale ? $user->settings->locale : 'en');
            $currentUser = $user->id;
            $settings = Setting::where('user_id', $currentUser)->first();
            return view('landingPage.template', compact('settings', 'user'));
        }
    }


    /****** Landing Page2 *******/
    public static function landingPage2(Request $request, $locale)
    {
        $requestSegments = request()->segments(0);

        if ($requestSegments[1]) {
            $user = User::with('settings')->where('store_handle', $requestSegments[1])->orWhere('store_name', $requestSegments[1])->first();

            if (!$user) {
                return abort(404);
            }
            setLan($user->settings->locale ? $user->settings->locale : 'en');
            $currentUser = $user->id;
            $settings = Setting::where('user_id', $currentUser)->first();

            return view('landingPage.template', compact('settings', 'user'));
        }
    }

    public function uploadVideo(Request $request, $locale)
    {
        checkLinkExpiration($request);

        setLan($locale);
        if ($this->store !== '') {
            $user = User::with('settings')->where('name', $this->store)->first();

            if (!$user || !$user->settings) {
                return abort(404);
            }
            $currentUser = $user->id;
            $settings = Setting::where('user_id', $currentUser)->first();
            return view('landingPage.video', compact('settings', 'user'));
        }
    }

    /***** Get Current User   *****/
    public function getCurrentUser($store)
    {
        $user = User::where('name', $store)->first();
        if (!$user) {
            return abort(404);
        }
        return true;
    }

    // public function getCurrencySymbol($currency_code){

    //     $currencies = array(
    //         "GBP" => "£",
    //         "USD" => "$",
    //         "EUR" => "€",
    //         "TRY" => "₺",
    //         "JPY"=>"¥",
    //         "AUD"=>"$",
    //         "CAD"=>"$"
    //     );
    //     if(isset($currencies[$currency_code])){
    //        return $currencies[$currency_code];
    //     }
    //     return false;

    // }

    public function removeInspirationalVideo()
    {
        $settings = Setting::where('user_id', Auth::user()->id)->first();
        if ($settings) {
            $settings->video = '';
            $settings->save();
            return response()->json([
                'success' => true,
                'message' => "video Removed successfully",
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => "something went wrong",
            ]);
        }
    }
    public function removeLogo()
    {
        $settings = Setting::where('user_id', Auth::user()->id)->first();
        if ($settings) {
            $settings->logo = 'undefined';
            $settings->save();
            return response()->json([
                'success' => true,
                'message' => "Logo Removed successfully",
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => "something went wrong",
            ]);
        }
    }
    /******** fet current user data  *****/

    public function fetchCurrentUser()
    {
        $currentUser = Auth::user();
        if (!$currentUser->is_install) {
            $user = User::find($currentUser->id);
            $user->is_install = 1;
            $user->save();
        }
        $data['user'] = $currentUser;


        return response()->json([
            'success' => true,
            'message' => "Fetch data successfully",
            'data' => $data
        ]);
    }

    /**
     * create Email Template for a Merchant
     * @param Request $request
     *
     */

    public function saveEmailSettings(Request $request)
    {
        // $logo_path='';
        if ($request->filled('id')) {
            $user = User::find($request->id);
            if (!$user) {
                return redirect()->to('admin-dashboard');
            }
        } else {
            $user = Auth::user();
        }
        if ($request->file('logo')) {
            // saving new logo
            $logo_path = time() . '.' . $request->file('logo')->extension();
            $request->file('logo')->move(public_path('emails_logo'), $logo_path);
            $data['logo'] = $logo_path;
        }


        if ($request->logo == 'empty_logo') {
            $data['logo'] = '';
        }
        $data['subject'] = $request->subject ?? '';
        $data['body'] = $request->body ?? '';
        $data['btn_text'] = $request->buttonText ?? '';
        $data['btn_color'] = $request->buttonColorHex ?? '#000000';
        $data['type'] = $request->type;
        // $data['type'] = $request->type;
        $data['user_id'] = $user->id;
        $data['from'] = $request->from == '' ? $user->store_name : $request->from;
        EmailTemplate::updateOrCreate(
            ['user_id' => $user->id, 'type' => $request->type],
            $data
        );
        return response()->json([
            'success' => true,
            'message' => "Template Created Successfully",
            'data' => null
        ]);
    }

    /**
     * Fetch Template settings
     */

    public function fetchEmailSettings(Request $request)
    {
        if ($request->filled('id')) {
            $user = User::find($request->id);
            if (!$user) {
                return redirect()->to('admin-dashboard');
            }
        } else {
            $user = Auth::user();
        }
        $template = EmailTemplate::where('type', $request->type)
            ->where('user_id', $user->id)
            ->first();
        if ($template) {

            $data['template'] = $template;
            return response()->json([
                'success' => true,
                'message' => "Template Created Successfully",
                'data' => $data
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => "Data not found",
            'data' => null
        ]);
    }

    public function checkuploadedlogo()
    {
        $settings = Setting::find(Auth::user()->id);
        if ($settings) {
            return response()->json([
                'success' => true,
                'message' => "found",
                'data' => $settings->logo
            ]);
        }
        return response()->json([
            'success' => false,
            'message' => "not found",
            'data' => null
        ]);
    }

    /**
     * check store handle availablity
     */
    public function checkHandle(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'store_handle' => 'required',
        ], []);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'data' => null
            ]);
        }
        $handleExistance = User::where(function ($query) use ($request) {
            $query->where('store_handle', str_replace(' ', '_', $request->store_handle))
                ->orWhere('store_name', $request->store_handle);
        })->where('id', '!=', Auth::user()->id)->first();
        //dd(Auth::user()->id);
        if ($handleExistance) {
            return response()->json([
                'success' => false,
                'message' => "Store handle already exist",
                'data' => null
            ]);
        } else {
            return response()->json([
                'success' => true,
                'message' => "Store handle available",
                'data' => null
            ]);
        }
    }

    public function saveHandle(Request $request)
    {
        if ($request->filled('store_handle')) {
            User::find(Auth::user()->id)->update(['store_handle' => str_replace(' ', '_', $request->store_handle)]);

            return response()->json([
                'success' => true,
                'message' => "Store save",
                'data' => null
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => "something went wrong",
            'data' => null
        ]);
    }

    /**
     * Save Email Credentials
     */
    public function saveEmailCredentials(Request $request)
    {
        if ($request->filled('id')) {
            $user = User::find($request->id);
            if (!$user) {
                return redirect()->to('admin-dashboard');
            }
        } else {
            $user = Auth::user();
        }
        EmailCredentials::updateOrCreate(['user_id' => $user->id], [
            'mail_user_name' => $request->sender_email,
            'is_active' => $request->is_active ? 1 : 0,
            'api_secret_key' => $request->api_key,
            'endpoint' => $request->endpoint,
            'domain' => $request->domain,
            'user_id' => $user->id
        ]);

        return response()->json([
            'success' => true,
            'message' => "Settings saved",
            'data' => null
        ]);
    }

    /************* save klavio credentials ****************/
    public function saveKlavioCreds(Request $request)
    {
        KlavioCredential::updateOrCreate(['user_id' => Auth::user()->id], [
            'api_key' => Crypt::encrypt($request->api_key),
            'email' => $request->email,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Settings saved",
            'data' => null
        ]);
    }

    /************* Last 30 days logs ****************/

    public function logs(Request $request)
    {
        // dd($request->all());
        $now = Carbon::now();
        if ($request->filled('id')) {
            $user = User::find($request->id);
            if (!$user) {
                return redirect()->to('admin-dashboard');
            }
        } else {
            $user = Auth::user();
        }

        $logs = Log::where('user_id', $user->id)
            ->when($request->q ? true : false, function ($query) use ($request) {
                $query->where('email_type', 'like', '%' . $request->q . '%');
            })
            ->where('created_at', '>=', $now->subDays(30))
            ->whereNotNull('email_type')
            ->orderBy('created_at', $request->sort == 'desc' ? 'desc' : 'asc')
            ->get();
        $data['logs'] = $logs;
        return response()->json([
            'success' => true,
            'message' => "Logs fetched",
            'data' => $data
        ]);
    }
}
