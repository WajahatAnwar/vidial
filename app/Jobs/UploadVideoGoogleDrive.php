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
    public $file_path = null;
    public function __construct($user,$video_link, $file_path)
    {               
        $this->user = $user;
        $this->video_link = $video_link;
        $this->file_path = $file_path;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $gClient = new \Google_Client(); 
        /*********** making connection with google drive ***********/         
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
            'name' => $this->user->googleDriveCreds->folder_name,
            'mimeType' => 'application/vnd.google-apps.folder'
        ));
        // Check if the folder already exists
        $existingFolders = $service->files->listFiles(array(
            'q' => "name = '{$this->user->googleDriveCreds->folder_name}' and mimeType = 'application/vnd.google-apps.folder'",
        ));
        if (count($existingFolders->getFiles()) > 0) {
            $folder = $existingFolders->getFiles()[0]; // Use the first matching folder
        } else {
            // Create a new folder
            $folder = $service->files->create($fileMetadata, array('fields' => 'id'));
        }
        $filePath = $this->file_path;
        // Use pathinfo to get the file extension
        $pathInfo = pathinfo($filePath);

        // The file extension is stored in the 'extension' key of the $pathInfo array
        $fileExtension = $pathInfo['extension'];

        $file = new \Google_Service_Drive_DriveFile(array(
                'name' => time() . '.'. $fileExtension,
                'parents' => array($folder->id),
            ));
        $fileData = file_get_contents($this->video_link);

        $result = $service->files->create($file, array(
                'data' => $fileData,
                'mimeType' => 'video/'.$fileExtension, // Adjust the mime type accordingly
                'uploadType' => 'media',
            ));

        if ($result) {
            Log::info('File upload successfully');
        } else {
            Log::info('File Upload failed'. $this->user);
        }
        /** 
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
        */
    }
}
