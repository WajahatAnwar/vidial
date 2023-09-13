<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Contracts\Queue\ShouldBeUnique;

class UploadVideoGoogleDrive implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public $user = null;
    public $video_link = null;
    public $gClient = null;
    public function __construct($user,$video_link)
    {               
        $this->user = $user;
        $this->video_link = $video_link;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {


        $gClient = new \Google_Client();          
        $gClient = connectGoogleDrive($this->user);
       
        $service = new \Google_Service_Drive($gClient);

        $currentUser = User::find($this->user->id);
      

        $gClient->setAccessToken(json_decode($currentUser->gd_access_token, true));

        if ($gClient->isAccessTokenExpired()) {

            // SAVE REFRESH TOKEN TO SOME VARIABLE
            $refreshTokenSaved = $gClient->getRefreshToken();

            // UPDATE ACCESS TOKEN
            $gClient->fetchAccessTokenWithRefreshToken($refreshTokenSaved);

            // PASS ACCESS TOKEN TO SOME VARIABLE
            $updatedAccessToken = $gClient->getAccessToken();

            // APPEND REFRESH TOKEN
            $updatedAccessToken['refresh_token'] = $refreshTokenSaved;

            // SET THE NEW ACCES TOKEN
            $gClient->setAccessToken($updatedAccessToken);

            $currentUser->gd_access_token = $updatedAccessToken;

            $currentUser->save();
        }

        $fileMetadata = new \Google_Service_Drive_DriveFile(array(
            'name' => $this->user->googleDriveCreds->folder_name,             // ADD YOUR GOOGLE DRIVE FOLDER NAME
            'mimeType' => 'application/vnd.google-apps.folder'
        ));

        $folder = $service->files->create($fileMetadata, array('fields' => 'id'));

        

        $file = new \Google_Service_Drive_DriveFile(array('name' => time().'.mp4', 'parents' => array($folder->id)));

        $result = $service->files->create($file, array(

            'data' => $this->video_link, // ADD YOUR FILE PATH WHICH YOU WANT TO UPLOAD ON GOOGLE DRIVE
            'mimeType' => 'application/octet-stream',
            'uploadType' => 'media'
        ));

        // GET URL OF UPLOADED FILE

        $url = 'https://drive.google.com/open?id=' . $result->id;

        Log::info('job run successfully');
    }
}
