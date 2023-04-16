<?php

namespace App\Http\Controllers;

use App\Jobs\UserResetPasswordJob;
use App\Models\EmailTemplate;
use App\Models\PasswordReset;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Models\Setting;

class AuthController extends Controller
{
    //
    public function login(Request $request)
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
            $remember_me = ($request->remember_me == 'on') ? true : false;
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

    public function getSession(Request $request)
    {
        if (Auth::check()) {
            $user = Auth::user();
            return response()->json([
                'success' => true,
                'message' => 'Current User retrieved successfully!',
                'data' => $user,
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Session not exists!',
                'data' => null
            ]);
        }
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
            'link' => "https://5976-2400-adc5-1b3-b500-bcb0-202a-baea-9f0.ngrok-free.app/reset-password?token=$token&email=$request->email",
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
    public function app_install_index()
    {
        // $email_count  =  Plan::where('id',auth()->user()->plan_id)->first();
        // if(auth()->user()->init_flag == 0){
        // Auth::user()->update(['init_flag' => 1,'ugc_email_count' =>$email_count->ugc_email_count, 'ugc_video_count' =>$email_count->ugc_video_count,'remaining_email' => $email_count->ugc_email_count]);
        // }
        $shop = Auth::user();

        $shopData = $shop->api()->rest('get', '/admin/api/2022-07/shop.json');
        $shop->store_currency = $shopData['body']['shop']['currency'];
        $shop->email = $shopData['body']['shop']['email'];
        $shop->store_name = $shopData['body']['shop']['name'];
        // $shop->plan_id = 1;
        $shop->save();

        $inst = json_encode([
            ['id' => 1, 'value' => 'Record a video off up to 30 seconds'],
            ['id' => 2, 'value' => 'Share your genuine experience of the product'],
            ['id' => 3, 'value' => 'Showcase the product'],
            ['id' => 4, 'value' => "Tell why you've decided to try  " . $shop->store_name],
            ['id' => 5, 'value' => "Describe the main benefits of " . $shop->store_name],
        ]);

        // adding settings on installation
        Setting::firstOrCreate([
            'user_id' => $shop->id
        ], [
            'user_id' => $shop->id,
            'store_credit' => 50,
            'logo' => '',
            'instructions' => $inst,
            'instruction_title' => 'Send us a video to receive a ' . getCurrencySymbol($shop->store_currency) . '50 Gift Card',
            'video' => '',
            'page_color' => '#000000',
            'page_display_to_customers' => 5,
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
        $this->videoApprovedTemplate($shop->id, $user);
        $this->postPurchaseTemplate($shop->id, $user);
        $this->videoDeclinedTemplate($shop->id, $user);
        $this->reminderTemplate($shop->id, $user);
        
        return view('embedded');
    }

    public function videoApprovedTemplate($user_id,$user){
        $emailTemplate['logo'] = '';
        $emailTemplate['user_id'] = $user_id;
        $emailTemplate['subject'] = "Here's your " . getCurrencySymbol($user->store_currency) . $user->settings->store_credit . " discount code for " . $user->name;

        $emailTemplate['type'] = 'UGC_Approved';
        $emailTemplate['body'] = "<p><h1>Hello {{name}}! Here is your {{amount}} Gift Card!</h1></p>
<p><br>Hey, Congratulations, Your video for {{storename}} has been approved!</p>
<p><br>We are constantly inspired by the creativity and passion of our customers, and we appreciate your support.</p>
<p><br>Here is your Discount :{{discount_code}}</p>
<br>{{button}}
<p><br>Cheers!<br>{{storename}} Team</p>";

        $emailTemplate['btn_text'] = 'Shop Now';
        $emailTemplate['btn_color'] = '#000000';
        EmailTemplate::firstOrCreate(['user_id'=> $user_id,'type'=> 'UGC_Approved']
        ,$emailTemplate);
    }

    public function postPurchaseTemplate($user_id, $user)
    {

        $emailTemplate['logo'] = '';
        $emailTemplate['user_id'] = $user_id;
        $emailTemplate['subject'] = "Win a " . getCurrencySymbol($user->store_currency) . $user->settings->store_credit . " gift card from " . $user->name;

                           
        $emailTemplate['type'] = 'Post_Purchase';
        $emailTemplate['body'] = "<p><h1>Win a {{amount}} gift card by sharing your experience with us!</h1></p>
<p><br>Hello {{name}}, <br>Thank you for your previous order.</p>
<p><br>The feedback of our customers about our products is extremely valuable to us.</p>
<p>That's why we would like to offer you a {{amount}} gift card to our store in exchange for a video where you share your opinion about our products.</p>
<br>{{button}}
<br>
<p> We truly appreciate hearing our customers' feedback about our brand because satisfying you is our top priority.</p>
<br>{{storename}} Team";
        $emailTemplate['btn_text'] = 'Get my gift card';
        $emailTemplate['btn_color'] = '#000000';
        EmailTemplate::firstOrCreate(['user_id' => $user_id, 'type' => 'Post_Purchase'],$emailTemplate);
    }

    public function videoDeclinedTemplate($user_id, $user)
    {
        $emailTemplate['logo'] = '';
        $emailTemplate['user_id'] = $user_id;
        $emailTemplate['subject'] = "Message for your Video about " . $user->name;
       
        $emailTemplate['type'] = 'UGC_Declined';
        $emailTemplate['body'] = "<p><h1>Update on your Video for {{storename}}</h1></p>
<p><br>Sorry, Your video for {{storename}} was not approved for the following reason:</p>
{{reason_decline}}
<br>{{button}}
<br><p>No worries, you can try again if you want!</p>
<br>{{storename}} Team";

        $emailTemplate['btn_text'] = 'Get my Gift Card';
        $emailTemplate['btn_color'] = '#000000';
        EmailTemplate::firstOrCreate(
            ['user_id' => $user_id, 'type' => 'UGC_Declined'],
            $emailTemplate
        );
    }

    public function reminderTemplate($user_id, $user)
    {
        $emailTemplate['logo'] = '';
        $emailTemplate['user_id'] = $user_id;
        $emailTemplate['subject'] = "Share your feedback and receive " . getCurrencySymbol($user->store_currency) . $user->settings->store_credit . " from " . $user->name;
                           
        $emailTemplate['type'] = 'Reminder';
        $emailTemplate['body'] = "<p><h1>Win a {{amount}} gift card by sharing your experience with us!</h1></p>
<p><br>Hello {{name}}, <br>Thank you for your previous order.</p>
<p>The feedback of our customers about our products is extremely valuable to us.</p>
<br><p>That's why we would like to offer you a {{amount}} gift card to our store in exchange for a video where you share your opinion about our products</p>
<br>{{button}}
<br>
<p>We truly appreciate hearing our customers' feedback about our brand because satisfying you is our top priority.</p>
<br>{{storename}} Team";

        $emailTemplate['btn_text'] = 'Get my Gift Card';
        $emailTemplate['btn_color'] = '#000000';
        EmailTemplate::firstOrCreate(
            ['user_id' => $user_id, 'type' => 'Reminder'],
            $emailTemplate
        );
    }
}
