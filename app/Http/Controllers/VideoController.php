<?php

namespace App\Http\Controllers;
use GuzzleHttp\Client;
use Dropbox;
use Illuminate\Http\Request;
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
    //$token=getDropboxToken();
   // Set up Guzzle client
   $token = "sl.BZagzuLY0SsaDZja2NWoh2F-CZhRX1avx3BjhEHVFHWAxg-125301RFbpOWfbnIxMt7bLezO987FULGTgCFrOWVl_IT8sHRfe7Cb4s0zEzf7E8JRFUl5N2-5zPcsoGwY2v6prRA";
// $client = new Client([
//     'base_uri' => 'https://api.dropboxapi.com', // Replace with your API URL
//     'headers' => [
//         'Authorization' => $token,
//         'Accept' => 'application/json',
//         'Content-Type' => 'application/json',
//     ],
// ]);
$response = Http::withHeaders([
    'Authorization' => $token,
        'Accept' => 'application/json',
        'Content-Type' => 'application/json',
])->post('https://api.dropboxapi.com/2/files/list_folder', [
    'include_deleted' => false,
    'include_has_explicit_shared_members' => false,
    'include_media_info' => false,
    'include_mounted_folders' => true,
    'include_non_downloadable_files' => true,
    'path' => '',
    "recursive"=> false
]);

dd($response);
// Set up request parameters
$params = [
    'include_deleted' => false,
    'include_has_explicit_shared_members' => false,
    'include_media_info' => false,
    'include_mounted_folders' => true,
    'include_non_downloadable_files' => true,
    'path' => '',
    "recursive"=> false
];

// Send POST request
$response = $client->post('/2/files/list_folder', [
    'json' => $params,
]);

// Get response body
$body = $response->getBody()->getContents();

// Decode JSON response
$data = json_decode($body, true);
dd($data);
// Do something with response data

    return response()->json(['success' => true,'token'=>$token]);


 }


      


}
