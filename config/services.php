<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mantle' => [
        'api_url' => env('REACT_APP_MANTLE_API_URL'),
        'app_id' => env('REACT_APP_MANTLE_APP_ID'),
        'api_key' => env('REACT_APP_MANTLE_APP_API_KEY'),
        'event_app_id' => env('MANTLE_AP_ID'),
    ],

    'dropbox' => [
        'client_id' => env('DROPBOX_CLIENT_ID'),
        'secret_id' => env('DROPBOX_SECRET_ID'),
        'authorization_code' => env('AUTHORIZATION_CODE'),
        'refresh_token' => env('REFRESH_TOKEN'),
    ],

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
        'username' => env('MAIL_USERNAME'),
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

];
