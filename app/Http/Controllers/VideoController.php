<?php

namespace App\Http\Controllers;
use GuzzleHttp\Client;
use Dropbox;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Video;
use Auth;
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
   $token = "Bearer sl.BZZMLX6hlAy55dpeXUDHzcg-GbMEEzmdDgEvtO9fwdOOl0dSY6U6Q6xPdYJaqafZ1PZomLF_kBAyEJoQG0PaGQqpkfZQLv8-9W2yIRbv-oMM7kFjUbVRroP6sqsQ0N_pla-blPjc";
   
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
$video['status']='Pending';
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


/****** get videos  ********/

public function getPendingVideos(Request $request){
    $videos = video::where('user_id',Auth::user()->id)
    ->where('status','=',config('constants.video_pending'))
    ->get();
    return response()->json([
        'success' => true,
        'message' => 'Fetch Pending Videos Successfully',
        'data'=>$videos
    ]);
}
/****** operation on Videos  ********/

public function videoOperation(Request $request){
    $videos = video::where('user_id',Auth::user()->id)
    ->where('id',$request->video_id)
    ->first();
    if($videos){
        $videos->status = $videos->type ? config('constants.video_approved') : config('constants.video_reject');
        $videos->save();
        return response()->json([
            'success' => true,
            'message' => 'Status Changed Successfully',
        ]);
    }
    return response()->json([
        'success' => false,
        'message' => 'Something Went Wrong',
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


}
