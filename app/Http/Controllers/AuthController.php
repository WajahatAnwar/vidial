<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\SaveMentalTokenJob;
use App\Jobs\UserResetPasswordJob;
use App\Models\EmailTemplate;
use App\Models\PasswordReset;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function login()
    {
        return Inertia::render('Auth/login');
    }

    public function login_store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required',
            'password' => 'required',
        ], []);

        if ($validator->fails()) {
            $str['success'] = false;
            $error = $validator->errors()->toArray();
            foreach ($error as $x_value) {
                $err[] = $x_value[0];
            }
            $str['message'] = $err['0'];
            // $str['data'] = $validator->errors()->toArray();
            return $str;
        } else {
            $credentials = $request->only('email', 'password');
            $remember_me = ($request->remember_me == "true") ? true : false;
            $user = null;
            if (Auth::attempt($credentials, $remember_me)) {
                $user = Auth::user();
                return response()->json([
                    'success' => true,
                    'message' => 'User Logged in successfully',
                    'user' => $user
                ]);
            }
            return response()->json([
                'success' => false,
                'message' => 'Invalid Credentials',
                'user' => $user,
            ]);
        }
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'User Logged out successfully',
            'user' => null
        ]);
    }

    public function resetPasswordAction(Request $request)
    {
        $user = User::firstWhere('email', $request->email);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found with this email',
                'data' => null
            ]);
        }
        $token = Str::random(64);
        $data = [
            'name' => $user->name,
            'email' => $user->email,
            'link' => env('APP_URL') . "/reset-password?token=$token&email=$request->email",
        ];
        $passwordReset = PasswordReset::create([
            'email' => $user->email,
            'token' => $token,
        ]);
        UserResetPasswordJob::dispatch($data);

        return response()->json([
            'success' => true,
            'message' => 'A link for resetting account has been emailed to you! Please check your email for details',
            'data' => null
        ]);
    }

    public function createNewPassword(Request $request, $token)
    {
        $passwordReset = PasswordReset::where('email', $request->email)->where('token', $token)->first();
        if (!$passwordReset) {
            return response()->json([
                'success' => false,
                'message' => 'Token already Used.',
            ]);
        }
        $passwordReset->delete();
        return response()->json([
            'success' => true,
            'message' => 'User ONE TIME Token deleted successfully',
        ]);
    }

    public function setPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'exists:users',
            'password' => 'required|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'data' => null
            ]);
        }

        $password = bcrypt($request->password);
        $user = User::firstWhere('email', $request->email);
        $user->update([
            'password' => $password,
        ]);
        return response()->json([
            'success' => true,
            'message' => 'Password reset successful!',
            'data' => null
        ]);
    }

    /******* Installation App ******/
    public function index()
    {
        // $email_count  =  Plan::where('id',auth()->user()->plan_id)->first();
        // if(auth()->user()->init_flag == 0){
        // Auth::user()->update(['init_flag' => 1,'ugc_email_count' =>$email_count->ugc_email_count, 'ugc_video_count' =>$email_count->ugc_video_count,'remaining_email' => $email_count->ugc_email_count]);
        // }
        // dd("resquest->all()");

        $shop = Auth::user();
        $shop = User::find($shop->id);
        Log::info('Shop identified and updated successfully'.$shop->customer_api_token);

        if(empty($shop->customer_api_token)){
            Log::info('Shop identified and updated successfully');
            SaveMentalTokenJob::dispatch($shop);
        }

        $x_forwarded_for = $_SERVER["HTTP_X_FORWARDED_FOR"];

        $shopData = $shop->api()->rest('get', '/admin/api/2022-07/shop.json');
        $shop_store_name = $shopData['body']['shop']['name'];
        $shop->store_currency = $shopData['body']['shop']['currency'];
        $shop->email = $shopData['body']['shop']['email'];
        $shop->store_name = $shop_store_name;
        /**
         * check shop handle already exist
         */
        // $handleExistance = User::where(function ($query) use ($shop_store_name) {
        //     $query->where('store_handle',$shop_store_name)
        //     ->orWhere('store_name', $shop_store_name);
        // })->where('id', '!=', Auth::user()->id)->first();
        // if($handleExistance){

        //     $shop->store_handle = str_replace(' ','_', $shopData['body']['shop']['name'] . '_' . Str::random(5));

        // }else {
        //     $shop->store_handle = str_replace(' ', '_', $shopData['body']['shop']['name']);
        // }

        // $shop->plan_id = 1;
        $shop->save();

        $inst = json_encode([
            ['id' => 1, 'value' => 'Record a video (up to 30 seconds)'],
            ['id' => 2, 'value' => 'Share your genuine experience of the product'],
            ['id' => 3, 'value' => 'Showcase the product'],
            // ['id' => 4, 'value' => "Tell why you've decided to try  " . $shop->store_name],
            ['id' => 4, 'value' => "Explain why you've decided to try the product"],
            ['id' => 5, 'value' => "Describe the main benefits of the product"],
        ]);

        /**
         * check shop handle already exist
         */

        if (User::where('id', $shop->id)->whereNull('store_handle')->first()) {

            $handleExistance = User::where(function ($query) use ($shop_store_name) {
                $query->where('store_handle', $shop_store_name)
                    ->orWhere('store_name', $shop_store_name);
            })->where('id', '!=', Auth::user()->id)->first();
            if ($handleExistance) {
                User::where('id', $shop->id)->update([
                    'store_handle' => str_replace(' ', '_', $shopData['body']['shop']['name'] . '_' . Str::random(5))
                ]);
            } else {
                User::where('id', $shop->id)->update([
                    'store_handle' => str_replace(' ', '_', $shopData['body']['shop']['name'])
                ]);
            }
        }


        // adding settings on installation
        Setting::firstOrCreate([
            'user_id' => $shop->id
        ], [
            'user_id' => $shop->id,
            'store_credit' => 50,
            'logo' => '',
            'instructions' => $inst,
            'instruction_title' => 'Send us a video and receive a discount of up to ' . getCurrencySymbol($shop->store_currency) . '75 on your next purchase',
            'video' => '',
            'page_color' => '#28282B',
            'page_display_to_customers' => 3,
            'email_sent_to_customer' => 2,
            'page_link' => 10,
            'locale' => 'en',
            'email_status' => 'true'
        ]);


        $current_user = User::find(Auth::user()->id);

        if ($current_user->role_id == null) {
            $current_user->role_id = 2;
            $current_user->save();
        }
        $user = User::with('settings')->find($shop->id);
        $this->starVideoApprovedTemplate($shop->id, $user);
        $this->videoApprovedTemplate($shop->id, $user);
        $this->postPurchaseTemplate($shop->id, $user);
        $this->videoDeclinedTemplate($shop->id, $user);
        $this->reminderTemplate($shop->id, $user);

        $json_array = [
            "api_key" => "pk_thN2QcHq",
            "shopName" => "$shop->name",
            "appId" => "31461507073",
            "XFF" => "$x_forwarded_for"
        ];
        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => 'https://platform.shoffi.app/v1/newMerchant',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => json_encode($json_array),
            CURLOPT_HTTPHEADER => array(
                'Content-Type: application/json'
            ),
        ));
        $response = curl_exec($curl);
        curl_close($curl);
        // dd($response);

        return Inertia::render('MyApplication/GetStarted');
    }

    /******************* on App Install Email Settings ***********************/
    public function starVideoApprovedTemplate($user_id, $user)
    {
        $emailTemplate['logo'] = '';
        $emailTemplate['user_id'] = $user_id;
        $emailTemplate['subject'] = "Claim your discount code";

        $emailTemplate['type'] = 'UGC_Star_Approved';
        $emailTemplate['body'] = '<p style="text-align: left;">Hello,</p>
<p style="text-align: left;">Congratulations, your video has been approved and marked as a Star video! This means you’re getting an even better discount for submitting an especially great video.&nbsp;</p>
<p style="text-align: left;">We appreciate your support and thank you so much for taking the time to make your video.</p>
<p style="text-align: left;">Here is your Discount code:</p>
<h1 style="text-align: left;">{{discount_code}}</h1>
<p style="text-align: left;">You can use this code at the checkout to receive your {{amount}} discount.<br><br>{{button}}</p>';

        $emailTemplate['btn_text'] = 'Shop Now';
        $emailTemplate['btn_color'] = '#28282B';
        $emailTemplate['from'] = auth()->user()->store_name;
        EmailTemplate::firstOrCreate(
            ['user_id' => $user_id, 'type' => 'UGC_Star_Approved'],
            $emailTemplate
        );
    }

    public function videoApprovedTemplate($user_id, $user)
    {
        $emailTemplate['logo'] = '';
        $emailTemplate['user_id'] = $user_id;
        $emailTemplate['subject'] = "Claim your discount code";

        $emailTemplate['type'] = 'UGC_Approved';
        $emailTemplate['body'] = '<p style="text-align: left;">Hello,</p>
<p style="text-align: left;">Congratulations, your video has been approved!&nbsp;</p>
<p style="text-align: left;">We appreciate your support and thank you so much for taking the time to make your video.</p>
<p style="text-align: left;">Here is your Discount code:</p>
<h1 style="text-align: left;">{{discount_code}}</h1>
<p style="text-align: left;">You can use this code at the checkout to receive your {{amount}} discount.<br><br>{{button}}</p>';

        $emailTemplate['btn_text'] = 'Shop Now';
        $emailTemplate['btn_color'] = '#28282B';
        $emailTemplate['from'] = auth()->user()->store_name;
        EmailTemplate::firstOrCreate(
            ['user_id' => $user_id, 'type' => 'UGC_Approved'],
            $emailTemplate
        );
    }

    public function postPurchaseTemplate($user_id, $user)
    {

        $emailTemplate['logo'] = '';
        $emailTemplate['user_id'] = $user_id;
        $emailTemplate['subject'] = "Send a video and we'll send a big discount";


        $emailTemplate['type'] = 'Post_Purchase';
        $emailTemplate['body'] = "<p style='text-align: left;'>Hello {{name}},</p>
<p style='text-align: left;'>You recently made a purchase from us and we'd love to hear your thoughts!</p>
<p style='text-align: left;'>We are offering a <strong>{{amount}} discount code</strong> to our store in exchange for a video where you give us feedback about your experience.</p>
<p style='text-align: left;'>Could you take 30 seconds of your time for <strong>{{amount}} </strong>?</p><p style='text-align: center;'>{{button}}</p>";
        $emailTemplate['btn_text'] = 'Record Video';
        $emailTemplate['btn_color'] = '#28282B';
        $emailTemplate['from'] = auth()->user()->store_name;
        EmailTemplate::firstOrCreate(['user_id' => $user_id, 'type' => 'Post_Purchase'], $emailTemplate);
    }

    public function videoDeclinedTemplate($user_id, $user)
    {
        $emailTemplate['logo'] = '';
        $emailTemplate['user_id'] = $user_id;
        $emailTemplate['subject'] = "Update about your video";

        $emailTemplate['type'] = 'UGC_Declined';
        $emailTemplate['body'] = '<p style="text-align: left;">Hello,</p>
<p style="text-align: left;">Sorry, your video was not approved for the following reason:</p>
<p style="text-align: left;"><em>"&ldquo;{{reason_decline}}&rdquo;"</em></p>
<p style="text-align: left;">No worries, you can still try again and get your <strong>{{amount}}</strong>!</p>
<p style="text-align: left;">{{button}}</p>';

        $emailTemplate['btn_text'] = 'Record Video';
        $emailTemplate['btn_color'] = '#28282B';
        $emailTemplate['from'] = auth()->user()->store_name;
        EmailTemplate::firstOrCreate(
            ['user_id' => $user_id, 'type' => 'UGC_Declined'],
            $emailTemplate
        );
    }

    public function reminderTemplate($user_id, $user)
    {
        $emailTemplate['logo'] = '';
        $emailTemplate['user_id'] = $user_id;
        $emailTemplate['subject'] = "Share your Thoughts on {{storename}}";

        $emailTemplate['type'] = 'Reminder';
        $emailTemplate['body'] = "<p style='text-align: left;'>Hello {{name}},</p>
<p style='text-align: left;'>We noticed you haven't yet submitted your video review!&nbsp;</p>
<p style='text-align: left;'>Remember, we're offering a <strong>{{amount}} discount code</strong> for just 30 seconds of your time!</p>
<p style='text-align: left;'>Your thoughts and feedback are important to us, and we're excited to hear what you think about your purchase.</p>
<p style='text-align: left;'>Don't miss out on this opportunity. Could you take 30 seconds to share your experience and claim your <strong>{{amount}} Gift Card</strong>?<br><br>{{button}}</p>";

        $emailTemplate['btn_text'] = 'Submit a Review';
        $emailTemplate['btn_color'] = '#28282B';
        $emailTemplate['from'] = auth()->user()->store_name;
        EmailTemplate::firstOrCreate(
            ['user_id' => $user_id, 'type' => 'Reminder'],
            $emailTemplate
        );
    }

    public function appDashboard()
    {
        return Inertia::render('MyApplication/Dashboard');
    }

    public function  getuserSettings()
    {
        $user = Auth::user();
        return responseJson(true, 'Settings fetched successfully', $user);
    }

}
