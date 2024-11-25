<?php

namespace App\Http\Controllers\AllInOne;
use App\Http\Controllers\Controller;

use App\Jobs\AllInOne\UserResetPasswordJob;
use App\Models\AllInOne\PasswordReset;
use App\Models\AllInOne\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
}
