<?php

namespace App\Http\Controllers;

use Auth;
use Dropbox;
use DateTime;
use DateTimeZone;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Video;
use GuzzleHttp\Client;
use App\Jobs\videoMail;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class VideoController extends Controller
{
      public function index(Request $request){
        $client = new Client(env('DROPBOX_ACCEESS_TOKEN',''), env('DROPBOX_APP_NAME',''));
        $file = $request->file('file');
        $path = '/Videos/' . $file->getClientOriginalName();
$mode = \Dropbox\WriteMode::add();
$result = $client->uploadFile($path, $mode, fopen($file->getRealPath(), 'rb'));
if ($result) {
    return response()->json(['success' => true]);
} else {
    return response()->json(['success' => false]);
}
      }
/****** test upload video on dropbox  ********/

public function testupload(Request $request){
   return view('landingPage.test');
}
public function testUploaded(Request $request){

    $file = $request->file('video');
    $request->validate([
        'video' => 'required|mimetypes:video/avi,video/mpeg,video/quicktime,video/mp4',
    ], [
        'video.required' => 'Please select a video file',
        'video.mimetypes' => 'Please upload a valid video file'
    ]);
    $token ="Bearer sl.BZltdKFVlg8ZeudLmlBMk5SxuoZIfKxJ-BscwRA0PfBU5o76V01LAtq2qdY3My8dU6l7viS6L9cLh0VgHcE9vAiI2BXepeyb5QE2B3KdA8MRHYEAaSK8uM31g_oWm9brlp9Hk6GQ";
    try {
    $client = new Client([
        'headers' => [
            'Authorization' => $token,
            'Content-Type' => 'application/octet-stream',
            'Dropbox-API-Arg' => json_encode([
                'path' => '/vidial/' . $file->getClientOriginalName(),
                'mode' => 'add',
                'autorename' => true,
                'mute' => false,
            ])
        ]
    ]);

    $response = $client->request('POST', 'https://content.dropboxapi.com/2/files/upload', [
        'body' => fopen($file, 'r'),
    ]);
} catch (\Exception $e) {

    Log::error('An error occurred: ' . $e->getMessage());
}

// Get response body
$body = $response->getBody()->getContents();
$data = json_decode($body, true);
dd($data['path_display']);
// fetching Preview Link
if(isset($data['path_display']) && !empty($data['path_display'])){
  try{
    $client = new Client();
    $response = $client->post('https://api.dropboxapi.com/2/files/get_temporary_link', [
        'headers' => [
            'Authorization'=> $token
        ],
        'json' => [
            'path' => $data['path_display'],
        ],
    ]);
    $videoLink = json_decode($response->getBody()->getContents(), true)['link'];

  }catch (\Exception $e) {
    Log::error('An error occurred: ' . $e->getMessage());
  }
}
// save Preview Link into DB
$video['video_link']=$videoLink;
$video['email']='test@gmail.com';
$video['status']=config('constants.video_pending');
$video['user_id']=1;
if(Video::create($video)){
    return response()->json([
        'success' => true,
        'message' => 'Video Uploaded Successfully',
    ]);
}
return response()->json([
    'success' => false,
    'message' => 'Something went wrong',
]);

 }


/****** get pending videos  ********/

public function getPendingVideos(Request $request){
    $videosPerPage = 4;
    $limit = $request->page * $videosPerPage;
    $totalVideos = video::where('user_id',Auth::user()->id)
        ->where('status','=',config('constants.video_pending'))
        ->count();
    $totalPages = ceil($totalVideos / $videosPerPage);
    $videos = video::where('user_id',Auth::user()->id)
    ->where('status','=',config('constants.video_pending'))
    ->get()->take($limit);
    return response()->json([
        'success' => true,
        'message' => 'Fetch Pending Videos Successfully',
        'data'=>$videos,
        'totalPages' => $totalPages
    ]);
}
/****** operation on Videos  ********/

public function videoOperation(Request $request){
   
    $user = User::find(Auth::user()->id);
    $remainingVideos = $user->remaining_videos ? $user->remaining_videos : $user->ugc_video_count;
    $remaining_email = $user->remaining_email;
    // remaining video
    if($remainingVideos <=0 ){
        return response()->json([
            'success' => false,
            'message' => 'Video Limitation has been expired',
        ]);
    }
    if($remaining_email <=0 ){
        return response()->json([
            'success' => false,
            'message' => 'Email Limitation has been expired',
        ]);
    }
    $videos = video::where('user_id',Auth::user()->id)
    ->where('id',$request->video_id)
    ->where('status','!=',config('constants.video_approved'))
    ->first();
    if($videos){
        $videos->status = $request->type ? config('constants.video_approved') : config('constants.video_reject');
        $videos->save();
        $code = $this->createDiscountCode();
         
        $details = [
            'mail' => $videos->email,
            'title' => 'Mail From Vidal',
            'body' => 'This is the test email for customers',
            'coupen_code' => $code['code']
        ];
        dispatch(new videoMail($details));
       $updateUser= User::find(Auth::user()->id);
       $updateUser->remaining_email=$remaining_email - 1;
       $updateUser->remaining_videos=$remainingVideos - 1;
       $updateUser->save();

        return response()->json([
            'success' => true,
            'message' => 'Status Changed Successfully',
            'data'=>  $code,
        ]);
    }
    return response()->json([
        'success' => false,
        'message' => 'Something Went Wrong',
    ]);


}
/****** get Approved videos  ********/
public function getApprovedVideos(Request $request){
    $videosPerPage = 4;
    $limit = $request->page * $videosPerPage;
    $totalVideos = video::where('user_id',Auth::user()->id)
        ->where('status','=',config('constants.video_approved'))
        ->count();
    $totalPages = ceil($totalVideos / $videosPerPage);
    $videos = video::where('user_id',Auth::user()->id)
    ->where('status','=',config('constants.video_approved'))
    ->get()->take($limit);
    return response()->json([
        'success' => true,
        'message' => 'Fetch Approved Videos Successfully',
        'data'=>$videos,
        'totalPages' => $totalPages
    ]);
}

public function testUp(Request $request){
    return response()->json([
        'success' => false,
        'message' => 'Something Went Wrong',
        'data'=>$request->all()
    ]);
}
public function sendTest(Request $request){
    return response()->json([
        'success' => false,
        'message' => 'Something Went Wrong',
        'data'=>$request->all()
    ]);
}

 // test function
 public function test(Request $request){

  dd('hi');

    try{
        $token ="Bearer sl.BZnaalQHjOM-wadrKh4Ek2Cxtp0lt1REIp7_wNMOu2OJWbUrgwzU8OyGErBf8HPeernpeIjyKVjXtrwbvzzPgXjvvF2NU4AEHqK0013EtI_W9JDnW_dbCGN4v0f3ijGwI3RqQBAi";
        $client = new Client();
        $response = $client->post('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', [
            'headers' => [
                'Authorization'=> $token,
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'path' => '/testing/testing2.mp4',
                'settings' => [
                    'requested_visibility' => [
                        '.tag' => 'public',
                    ],
            ],
        ]]);
        $videoLink = json_decode($response->getBody()->getContents(), true)['url'];
        $replaced=str_replace("www.dropbox.com","dl.dropboxusercontent.com",$videoLink);

      }catch (\Exception $e) {
           dd($e->getMessage());
        Log::error('An error occurred: ' . $e->getMessage());
      }



      dd($videoLink,$replaced);

    // successfully running code Create Price Rule


    $shop = Auth::user();
    $rules_requirements=[
        "price_rule"=>[
        "title"=>"vidial_code",
        "target_type"=>"line_item",
        "target_selection"=>"all",
        "allocation_method"=>"across",
        "value_type"=>"fixed_amount",
        "price_rule"=>"-10.0",
        "customer_selection"=>"all",
        "value"=>"-10.0",
        "starts_at"=> Carbon::now()->toIso8601String(),
    ]];
    $priceRule = $shop->api()->rest('POST', '/admin/api/2022-10/price_rules.json',$rules_requirements);
    // Generating Discount Code
    if(isset($priceRule['body']['price_rule']['id']) && !empty($priceRule['body']['price_rule']['id'])){

        $discountCode = ['discount_code'=>
        [
            "price_rule_id"=>$priceRule['body']['price_rule']['id'],
            "code"=>$this->generateUniqueDiscountCode(),
        ]
    ];
        $discount = $shop->api()->rest('POST', '/admin/api/2023-01/price_rules/'.$priceRule['body']['price_rule']['id'].'/discount_codes.json',$discountCode);
    }
    dd($discount['discount_code']['id']);



    return;
}
//  Generating Unique Discount Code
  public function generateUniqueDiscountCode(){
    $code = substr(base_convert(sha1(uniqid(mt_rand())), 16, 36), 0, 10);
    return $code = 'vidial'.$code;
  }

  // Get Date and Time
  public function dateAndTime(){
    $date = new DateTime(Carbon::now(), new DateTimeZone('-05:00'));
$formattedDate = $date->format('c');
return $formattedDate;
  }

  // Upload video on dropbox
  public function uploadDropboxVideo(Request $request){
    $file = $request->file('files')[0];
    $dropbox = updateDropboxToken();
    $token = 'Bearer '.$dropbox['access_token'];

    try {
    $client = new Client([
        'headers' => [
            'Authorization' => $token,
            'Content-Type' => 'application/octet-stream',
            'Dropbox-API-Arg' => json_encode([
                'path' => '/vidial/'. time() .'.' . $file->extension(),
                'mode' => 'add',
                'autorename' => true,
                'mute' => false,
            ])
        ]
    ]);

    $response = $client->request('POST', 'https://content.dropboxapi.com/2/files/upload', [
        'body' => fopen($file, 'r'),
    ]);
} catch (\Exception $e) {

    Log::error('An error occurred: ' . $e->getMessage());
}

// Get response body
$body = $response->getBody()->getContents();
$data = json_decode($body, true);
// fetching Preview Link
if(isset($data['path_display']) && !empty($data['path_display'])){
  try{
    $client = new Client();
        $response = $client->post('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', [
            'headers' => [
                'Authorization'=> $token,
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'path' => $data['path_display'],
                'settings' => [
                    'requested_visibility' => [
                        '.tag' => 'public',
                    ],
            ],
        ]]);
        $videoLink = json_decode($response->getBody()->getContents(), true)['url'];
        $videoLink=str_replace("www.dropbox.com","dl.dropboxusercontent.com",$videoLink);

  }catch (\Exception $e) {

 Log::error('An error occurred: ' . $e->getMessage());
}
}
return response()->json([
    'success' => true,
    'message' => 'Video Uploaded Successfully',
    'data' => $videoLink
]);
}
// // save Preview Link into DB
// $video['video_link']=$videoLink;
// $video['email']='test@gmail.com';
// $video['status']='Pending';
// $video['user_id']=1;
// if(Video::create($video)){
//     return response()->json([
//         'success' => true,
//         'message' => 'Video Uploaded Successfully',
//     ]);
// }
// return response()->json([
//     'success' => false,
//     'message' => 'Something went wrong',
// ]);

// save User Uploaded data into database
  public function saveVideo(Request $request){
      // save Preview Link into DB
$video['video_link']=$request->video_link;
$video['email']=$request->email;
$video['status']='Pending';
$user = User::where('name',$request->store)->first();
if(!$user){
    return response()->json([
        'success' => false,
        'message' => 'Store not found',
    ]);
}
$video['user_id']=$user->id;
if(Video::create($video)){
    return response()->json([
        'success' => true,
        'message' => 'Video Uploaded Successfully',
    ]);
}
return response()->json([
    'success' => false,
    'message' => 'Something went wrong',
]);
  }

  public function testing(){
    
    $shop = Auth::user();
    $shopData = $shop->api()->rest('get', '/admin/api/2023-01/shop.json');
    dd($shopData['body']['shop']['currency']);
  }

  // create discount code

  public function createDiscountCode(){

    $shop = Auth::user();
    $settings=Setting::where('user_id',Auth::user()->id)->first();
    $rules_requirements=[
        "price_rule"=>[
        "title"=>"vidial_code",
        "target_type"=>"line_item",
        "target_selection"=>"all",
        "allocation_method"=>"across",
        "value_type"=>"fixed_amount",
        "price_rule"=>"-".$settings->store_credit,
        "customer_selection"=>"all",
        "value"=>"-10.0",
        "starts_at"=> Carbon::now()->toIso8601String(),
    ]];
    $priceRule = $shop->api()->rest('POST', '/admin/api/2022-10/price_rules.json',$rules_requirements);
    // Generating Discount Code
    if(isset($priceRule['body']['price_rule']['id']) && !empty($priceRule['body']['price_rule']['id'])){

        $discountCode = ['discount_code'=>
        [
            "price_rule_id"=>$priceRule['body']['price_rule']['id'],
            "code"=>$this->generateUniqueDiscountCode(),
        ]
    ];
        $discount = $shop->api()->rest('POST', '/admin/api/2023-01/price_rules/'.$priceRule['body']['price_rule']['id'].'/discount_codes.json',$discountCode);
    }

    return $discount['body']['discount_code'];
  }
}
