<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;


class SettingsController extends Controller
{
    public $store='';
    /**** Current User ******/

    public function __construct(Request $request){
        if(isset($request->store) && $request->store!==''){
            $this->store=$request->store;
        }
    }
    public function get_current_settings()
    {
        $current_user = Auth::user();
        $shop = User::find($current_user->id);

        $current_settings = Setting::where('user_id',$shop->id)->first();

        if(empty($current_settings)) {
            $current_settings = new Setting;
            $current_settings->user_id = $shop->id;
            $current_settings->save();
        }

        $current_settings = Setting::where('user_id',$shop->id)->first();

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

        if($request->pop_up_type == "client_gif") {

            $vbl3 = rand(100000000000000,999999999999999);
            $vbl4 = File::extension($request->new_file->getClientOriginalName());
            request()->new_file->storeAs('public/uploaded_images',$vbl3.".".$vbl4);
        }


        $current_settings = Setting::where('user_id',$shop->id)->first();
        $current_settings->user_id = $shop->id;
        $current_settings->pop_up_type = $request->pop_up_type;

        if($request->pop_up_type == "client_gif") {
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
    public function getSettings(){

        $data= Setting::where('user_id',Auth::user()->id)->first();

        $store=User::find(Auth::user()->id);
        if(!$data){
            return response()->json([
                'success' => false,
                'message' => "Data not found",
                'data'=>null
            ]);
        }
        $data['instructions'] = json_decode($data['instructions']);
        $data['store']=$store->name;
        return response()->json([
            'success' => true,
            'message' => "Settings get Successfully",
            'data'=>$data
        ]);
    }
    /******* save settings *****/
    public function saveSettings(Request $request){

        $video = '';
        if($request->file('logo')){
            $validatedData = $request->validate([
                'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                // 'video' => 'required|mimes:mp4,avi|max:50000',
                // add more rules for other fields if needed
            ]);
            $image = time().'.'.$request->file('logo')->extension();
            $request->file('logo')->move(public_path('logo'), $image);
        }else{
            $image=$request->logo;
        }
        if($request->file('video')){
            $validatedData = $request->validate([
                'video' => 'required|mimes:mp4,avi|max:50000',
                // add more rules for other fields if needed
            ]);
            $video = time().'.'.$request->file('video')->extension();
            $request->file('video')->move(public_path('video'), $video);
        }else{
            $video=$request->video ?? '';
        }

        $currentUser = Auth::user()->id;
        $settings['store_credit']=$request->store_credit;
        $settings['page_display_to_customers']=$request->page_display_to_customers;
        $settings['email_sent_to_customer']=$request->email_sent_to_customer;
        $settings['page_link']=$request->page_link;
        $settings['instructions']=$request->instructions;
        $settings['page_color']=$request->page_color ?? '#FF5175';
        $settings['user_id']=$currentUser;
        $settings['logo']=$image;
        $settings['video']=$video;
        $settings['email_status'] = $request->setting_status;
        Setting::updateOrCreate(['user_id'=>$currentUser],$settings);
        return response()->json([
            'success' => true,
            'message' => "Settings saved Successfully",
        ]);
    }

    /****** Landing Page *******/
    public function landingPage(Request $request,$locale){
        // Language Translation
        setLan($locale);
        if($this->store!==''){
            $user=User::with('settings')->where('name',$this->store)->first();

            if(!$user || !$user->settings){
              return abort(404);
            }
            $currentUser=$user->id;
            $settings=Setting::where('user_id',$currentUser)->first();
        return view('landingPage.template',compact('settings','user'));
        }
    }

    public function uploadVideo(Request $request,$locale){
        setLan($locale);
        if($this->store!==''){
            $user=User::with('settings')->where('name',$this->store)->first();
            if(!$user || !$user->settings){
                return abort(404);
            }
            $currentUser=$user->id;
            $settings=Setting::where('user_id',$currentUser)->first();
            return view('landingPage.video',compact('settings','user'));

        }

    }

    /***** Get Current User   *****/
    public function getCurrentUser($store){
        $user=User::where('name',$store)->first();
        if(!$user){
            return abort(404);
          }
          return true;
    }
    /***** Save Locale value   *****/
    public function saveLocale(Request $request){
        $current_user = Auth::user()->id;
        Setting::where('user_id',$current_user)->update([
            'locale'=>$request->value
        ]);

        return response()->json([
            'success' => true,
            'message' => "Language Changed Successfully",
        ]);
    }


}
