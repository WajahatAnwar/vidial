<?php
namespace App\Services\Cropica;

use Kunnu\Dropbox\Dropbox;
use Kunnu\Dropbox\DropboxApp;
use Kunnu\Dropbox\DropboxFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
class DropboxService
{
    protected $dropbox;

    public function __construct()
    {
         $app = new DropboxApp(
             env('DROPBOX_APP_KEY'),
             env('DROPBOX_APP_SECRET'),
             $this->updateDropboxToken()
         );
         $this->dropbox = new Dropbox($app);
    }

    public function uploadImagesFromDirectoryTest()
    {
        $timestamp = 'job-folder-'.time().'/another-folder';
        $this->createDropboxFolder($timestamp);

    }
    
    public function sendFilesToSpecificLocation($directory, $filePath){
        try {

            if (Storage::disk('public')->exists($filePath)) {
                $fileContent = Storage::disk('public')->get($filePath);
                $this->dropbox->upload($fileContent, $directory.$filePath, ['mode' => 'add']);       
                // Log::info("Uploaded Successfully.");    
            }
            else{
                // Log::info('Coulndt find file to send to dropbox.');
            }
        } catch (\Exception $e) {
            Log::info("Error uploading $filePath: " . $e->getMessage() . "\n");
        }     
    }

    public function uploadImagesFromDirectory($localDirectory, $dropboxDirectory)
    {
        $localDirectory = Storage::disk('public')->path($localDirectory);
        // Log::info('Initialized...');
        $this->createDropboxFolder(rtrim($dropboxDirectory, "/"));
        foreach (scandir($localDirectory) as $file) {
            // Log::info($file);
            if ($file !== '.' && $file !== '..') {
                $filePath = $localDirectory . $file;

                if (is_file($filePath)) {
                    try {
                        $dropboxFile = new DropboxFile($filePath);
                        $this->dropbox->upload($dropboxFile, "/" . $dropboxDirectory . $file, ['mode' => 'add']);
                        // Log::info("Uploaded: $file\n");
                    } catch (\Exception $e) {
                        Log::info("Error uploading $file: " . $e->getMessage() . "\n");
                    }
                }
                else{
                    // Log::info("Could not find file at $filePath");
                }
            }
        }
        // Log::info('Finished...');
    }

    public function updateDropboxToken()
    {
        $dropbox = Http::withHeaders([
            'Authorization' => 'Basic ' . base64_encode(env('DROPBOX_APP_KEY') . ':' . env('DROPBOX_APP_SECRET'))
        ])->asForm()->post('https://api.dropboxapi.com/oauth2/token', [
            'grant_type' => 'refresh_token',
            'refresh_token' => env('REFRESH_TOKEN')
        ]);
        return $dropbox['access_token'];
    }

    public function getDropboxToken()
    {
        $dropbox = Http::withHeaders([
            'Authorization' => 'Basic ' . base64_encode(env('DROPBOX_APP_KEY') . ':' . env('DROPBOX_APP_SECRET'))
        ])->asForm()->post('https://api.dropboxapi.com/oauth2/token', [
            'grant_type' => 'authorization_code',
            'code' => env('AUTHORIZATION_CODE', 'WkWlCkWJCeAAAAAAAAkXvXBCPwCkRHn1VgGoZksUf48')
        ]);
        return $dropbox;
    }
    public function createDropboxFolder($folderName)
    {
        try {
            $this->dropbox->createFolder('/' . $folderName);
            // Log::info("Created folder: $folderName");
        } catch (\Exception $e) {
            Log::info("Error creating folder $folderName: " . $e->getMessage() . "\n");
        }
    }

}
