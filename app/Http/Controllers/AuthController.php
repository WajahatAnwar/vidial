<?php

namespace App\Http\Controllers;

use App\Jobs\UserResetPasswordJob;
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

        return view('embedded');
    }
}
