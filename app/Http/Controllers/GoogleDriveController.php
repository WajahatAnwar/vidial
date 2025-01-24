<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Models\GoogleDriveCred;

class GoogleDriveController extends Controller
{
    public $gClient;
    public $currentUser = null;

    function __construct(Request $request)
    {




        // session()->put('token', $this->gClient->getAccessToken());
    }

    public function googleLogin(Request $request)
    {
        $this->gClient = new \Google_Client();
        $this->gClient->setClientId($request->session()->get('client_id'));
        $this->gClient->setClientSecret($request->session()->get('secret_key'));
        $this->gClient->setRedirectUri(route('google.login'));
        $this->gClient->setDeveloperKey($request->session()->get('api_key'));
        $this->gClient->setScopes(array(
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/drive'
        ));

        $this->gClient->setAccessType("offline");

        $this->gClient->setApprovalPrompt("force");

        $google_oauthV2 = new \Google_Service_Oauth2($this->gClient);

        if ($request->get('code')) {

            $this->gClient->authenticate($request->get('code'));

            $request->session()->put('token', $this->gClient->getAccessToken());
        }

        if ($request->session()->get('token')) {

            $this->gClient->setAccessToken($request->session()->get('token'));
        }

        if ($this->gClient->getAccessToken()) {

            //FOR LOGGED IN USER, GET DETAILS FROM GOOGLE USING ACCES
            $user = User::where('name', $request->session()->get('current_user'))->first();

            $user->gd_access_token = json_encode($request->session()->get('token'));

            $user->save();
            /************ saving credentials of google drive **************/
            GoogleDriveCred::updateOrCreate(['user_id' => $user->id], [
                'api_key' => $request->session()->get('api_key'),
                'secret_key' => $request->session()->get('secret_key'),
                'client_id' => $request->session()->get('client_id'),
                'folder_name' => $request->session()->get('folder_name'),
            ]);
            return redirect('gd-success');
            // dd("Successfully authenticated");
        } else {

            // FOR GUEST USER, GET GOOGLE LOGIN URL
            $authUrl = $this->gClient->createAuthUrl();

            return redirect()->to($authUrl);
        }
    }

    public function googleDriveFilePpload()
    {
        $service = new \Google_Service_Drive($this->gClient);

        $user = User::find(1);

        $this->gClient->setAccessToken(json_decode($user->access_token, true));

        if ($this->gClient->isAccessTokenExpired()) {

            // SAVE REFRESH TOKEN TO SOME VARIABLE
            $refreshTokenSaved = $this->gClient->getRefreshToken();

            // UPDATE ACCESS TOKEN
            $this->gClient->fetchAccessTokenWithRefreshToken($refreshTokenSaved);

            // PASS ACCESS TOKEN TO SOME VARIABLE
            $updatedAccessToken = $this->gClient->getAccessToken();

            // APPEND REFRESH TOKEN
            $updatedAccessToken['refresh_token'] = $refreshTokenSaved;

            // SET THE NEW ACCES TOKEN
            $this->gClient->setAccessToken($updatedAccessToken);

            $user->access_token = $updatedAccessToken;

            $user->save();
        }

        $fileMetadata = new \Google_Service_Drive_DriveFile(array(
            'name' => 'Vidial_latest',             // ADD YOUR GOOGLE DRIVE FOLDER NAME
            'mimeType' => 'application/vnd.google-apps.folder'
        ));

        $folder = $service->files->create($fileMetadata, array('fields' => 'id'));

        printf("Folder ID: %s\n", $folder->id);

        $file = new \Google_Service_Drive_DriveFile(array('name' => 'test.mp4', 'parents' => array($folder->id)));

        $result = $service->files->create($file, array(

            'data' => file_get_contents(public_path('test.mp4')), // ADD YOUR FILE PATH WHICH YOU WANT TO UPLOAD ON GOOGLE DRIVE
            'mimeType' => 'application/octet-stream',
            'uploadType' => 'media'
        ));

        // GET URL OF UPLOADED FILE

        $url = 'https://drive.google.com/open?id=' . $result->id;

        dd($result);
    }
    public function connectDrive(Request $request)
    {
        $request->session()->put('current_user', $request->shop);
        $request->session()->put('api_key', trim($request->api_key));
        $request->session()->put('secret_key', trim($request->secret_key));
        $request->session()->put('client_id', trim($request->client_id));
        $request->session()->put('folder_name', trim($request->folder_name));
        // return redirect('google-login',['params'=>$request->all()]);
        return redirect()->route('google.login', $request->all());
    }
    /**************  congratulations ***************/
    public function gdSuccess(Request $request)
    {
        return view('gd_success');
    }
}
