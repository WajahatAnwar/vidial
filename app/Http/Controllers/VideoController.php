<?php

namespace App\Http\Controllers;

use DateTime;
use DateTimeZone;
use Carbon\Carbon;
use App\Models\Plan;
use App\Models\User;
use App\Models\Video;
use App\Models\Charge;
use App\Models\Orders;
use GuzzleHttp\Client;
use App\Jobs\SendMantleEventJob;
use App\Models\Setting;
use App\Models\Discount;
use App\Jobs\ThanksMailjob;
use Illuminate\Http\Request;
use App\Jobs\EmailTemplateJob;
use App\Jobs\KlavioEmailJob;
use App\Models\KlavioCredential;
use Illuminate\Support\Facades\Log;
use App\Jobs\UploadVideoGoogleDrive;
use Illuminate\Support\Facades\Crypt;
use App\Models\Customer;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class VideoController extends Controller
{

    public function testupload(Request $request)
    {
        return view('landingPage.test');
    }

    /****** get pending videos  ********/
    public function getPendingVideos(Request $request)
    {

        $user = Auth::user();
        $user = User::find(id: $user->id);

        // $user = User::find(id: '333');
        // Log::info(json_encode($user, JSON_PRETTY_PRINT));
        // $response = $user->api()->rest('GET', 'admin/api/2024-01/webhooks.json');

        // Log::info("OKOKOKO");
        // Log::info(json_encode($response, JSON_PRETTY_PRINT));


        // $res2 = $user->api()->rest('POST', '/admin/api/2023-10/webhooks.json', [
        //         'webhook' => [
        //             'topic' => 'customers/create',
        //             'format' => 'json',
        //             'address' => 'https://app.goodauthentic.com/webhook/customers-create'
        //         ]
        //     ]);

        // Log::info(json_encode($res2, JSON_PRETTY_PRINT));


        if ($request->filled('id')) {
            $user = User::find($request->id);
            if (!$user) {
                return redirect()->to('admin-dashboard');
            }
        } else {
            $user = Auth::user();
        }

        $videosPerPage = 4;
        $limit = $request->page * $videosPerPage;
        $totalVideos = video::where('user_id', $user->id)
            ->where('status', '=', config('constants.video_pending'))
            ->count();
        $totalPages = ceil($totalVideos / $videosPerPage);
        $videos = video::where('user_id', $user->id)
            ->where('status', '=', config('constants.video_pending'))->orderBy('id', 'DESC')
            ->get()->take($limit);
        return response()->json([
            'success' => true,
            'message' => 'Fetch Pending Videos Successfully',
            'data' => $videos,
            'totalPages' => $totalPages,
            'videoCount' => $totalVideos
        ]);
    }
    /****** operation on Videos  ********/

    public function videoOperation(Request $request)
    {
        DB::beginTransaction();

        try {
            $user = Auth::user();
            $remainingVideos = $user->remaining_videos ?? $user->ugc_video_count;
            $remainingEmails = $user->remaining_email;

            if ($remainingVideos <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have reached the limit of videos allowed in your current plan, please upgrade your plan.',
                    'data' => ['remaining_videos' => 1]
                ], 403);
            }

            if ($remainingEmails <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have reached the limit of emails allowed in your current plan, please upgrade your plan.',
                    'data' => ['remaining_emails' => 1]
                ], 403);
            }

            $video = Video::with('order')
                ->where('user_id', $user->id)
                ->where('id', $request->video_id)
                ->where('status', '!=', config('constants.video_approved'))
                ->firstOrFail();

            $video->update([
                'approved_video_type' => $request->type == 'star_rating' ? 'star_rating' : null,
                'status' => config('constants.video_approved')
            ]);

            $discount_code = $this->createDiscountCode($request->type);

            $parts = explode('/', $discount_code[0]->id);
            $code_id = end($parts);

            $code = $discount_code[0]->code;

            $templateDetails = [
                'amount' => $user->settings->{$request->type == 'star_rating' ? 'star_credit' : 'store_credit'},
                'type' => $request->type == 'star_rating' ? 'UGC_Star_Approved' : 'UGC_Approved',
                'view' => $request->type == 'star_rating' ? 'emails.ugc_star_approved' : 'emails.ugc_approved',
                'user_id' => $user->id,
                'mail' => $video->email,
                'name' => optional($video->order)->customer_name,
                'storename' => $user->store_name,
                'url' => 'https://' . $user->name,
                'discount_code' => $code,
                'reason_decline' => ''
            ];

            $email_status = Setting::where('user_id', $user->id)->first()->email_status;
            if ($email_status != 'false') {
                dispatch(new EmailTemplateJob($templateDetails));
            } else {
                $klavio = KlavioCredential::where('user_id', $user->id)->first();
                Log::info(json_encode($klavio));
                dispatch(new KlavioEmailJob($klavio->api_key, $klavio->email, null, $templateDetails, $video->id));
            }
            $customerName = $video->order
                ? ($video->order->customer_name ?: '  ')
                : '';

            $logDetails = [
                'type' => "EMAIL",
                'send_to' => $video->email,
                'user_id' => $user->id,
                'customer_name' => $customerName,
                'customer_email' => $video->email,
                'email_type' => config('constants.video_approved'),
            ];
            update_log_file($logDetails);
            SendMantleEventJob::dispatch($user, config('constants.video_approved'), $logDetails);

            // Update user's remaining videos and emails
            $user->remaining_videos -= 1;
            $user->remaining_email -= 1;

            // Save discount history
            Discount::create([
                'discount_code' => $code,
                'discount_id' => $code_id,
                'video_id' => $video->id,
                'discount_meta' => json_encode($discount_code)
            ]);

            // Upload video to Google Drive if access token exists
            if ($user->gd_access_token) {
                dispatch(new UploadVideoGoogleDrive($user, $video->video_link, $video->path));
            }

            DB::commit(); // Commit the transaction if everything is successful

            return response()->json([
                'success' => true,
                'message' => 'Status Changed Successfully',
                'data' => $code,
            ]);

        } catch (\Exception $e) {
            DB::rollBack(); // Roll back the transaction in case of an error
            Log::error('Video Operation Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Something went wrong. Please try again later.',
            ], 500);
        }
    }

    public function videoOperationOLD(Request $request)
    {
        $user = User::find(Auth::user()->id);
        if ($user->remaining_videos === NULL || $user->remaining_videos == '') {
            $remainingVideos = $user->ugc_video_count;
        } else if ($user->remaining_videos == 0) {
            $remainingVideos = 0;
        } else {
            $remainingVideos = $user->remaining_videos;
        }
        $remainingEmail = $user->remaining_email;
        // remaining video
        if ($remainingVideos <= 0) {
            $data['remaining_Videos'] = 1;
            return response()->json([
                'success' => false,
                'message' => 'You have reached the limit of videos allowed in your current plan.To
            accept more videos,please upgrade your plan',
                'data' => $data
            ]);
        }
        if ($remainingEmail <= 0) {
            $data['remaining_emails'] = 1;
            return response()->json([
                'success' => false,
                'message' => 'You have reached the limit of emails allowed in your current plan.To
            accept more emails,please upgrade your plan',
                'data' => $data
            ]);
        }
        $videos = video::with('order')->where('user_id', Auth::user()->id)
            ->where('id', $request->video_id)
            ->where('status', '!=', config('constants.video_approved'))
            ->first();


        if ($videos) {
            $videos->approved_video_type = $request->type == 'star_rating' ? 'star_rating' : null;
            $videos->status = config('constants.video_approved');
            $videos->save();
            $current_settings = Setting::where('user_id', $user->id)->first();
            $code = $this->createDiscountCode($request->type);
            $redirect = 'https://' . $user->name;
            $customerName = $videos->order
                ? ($videos->order->customer_name ?: '')
                : '';
            // $customerName = optional($videos->order)->customer_name;
            if ($request->type == 'star_rating') {
                $temlateDetails['amount'] = Auth::user()->settings->star_credit;
                $temlateDetails['type'] = 'UGC_Star_Approved';
                $temlateDetails['view'] = 'emails.ugc_star_approved';
            } else {
                $temlateDetails['amount'] = Auth::user()->settings->store_credit;
                $temlateDetails['type'] = 'UGC_Approved';
                $temlateDetails['view'] = 'emails.ugc_approved';
            }
            $temlateDetails['user_id'] = Auth::user()->id;
            $temlateDetails['mail'] = $videos->email;
            $temlateDetails['name'] = $customerName;
            $temlateDetails['storename'] = auth()->user()->store_name;
            $temlateDetails['url'] = 'https://' . $user->name;
            //$temlateDetails['name'] = $videos->email;
            $temlateDetails['discount_code'] = $code['code'];
            $temlateDetails['reason_decline'] = '';
            $email_status = Setting::where('user_id', $user->id)->first()->email_status;
            if ($email_status != 'false') {
                dispatch(new EmailTemplateJob($temlateDetails));
            } else {
                $klavio = KlavioCredential::where('user_id', $user->id)->first();
                dispatch(new KlavioEmailJob($klavio->api_key, $klavio->email, null, $temlateDetails, $videos->id));
            }

            $log_details = [
                'type' => "EMAIL",
                'send_to' => $videos->email,
                'user_id' => $user->id,
                'customer_name' => $customerName,
                'customer_email' => $videos->email,
                'email_type' => config('constants.video_approved'),
            ];
            update_log_file($log_details);
            SendMantleEventJob::dispatch($user, config('constants.video_approved'), $log_details);

            $updateUser = User::find(Auth::user()->id);
            $updateUser->remaining_email = $remainingEmail - 1;
            $updateUser->remaining_videos = $remainingVideos - 1;
            $updateUser->save();

            /** save discount history */

            Discount::create([
                'discount_code' => $code['code'],
                'discount_id' => $code['id'],
                'video_id' => $videos->id,
                'discount_meta' => json_encode($code)
            ]);


            /*********************** saving approved video to Google Drive *************************/

            if ($user->gd_access_token) {
                dispatch(new UploadVideoGoogleDrive($user, $videos->video_link, $videos->path));
            }

            return response()->json([
                'success' => true,
                'message' => 'Status Changed Successfully',
                'data' => $code,
            ]);
        }
        return response()->json([
            'success' => false,
            'message' => 'Something Went Wrong',
        ]);
    }

    /******** reject video *****/
    public function rejectVideo(Request $request)
    {
        $user = User::find(Auth::user()->id);
        $remainingVideos = $user->remaining_videos == null ? $user->remaining_videos : $user->ugc_video_count;
        $remainingEmail = $user->remaining_email;

        if ($remainingEmail <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Email Limitation has been expired',
            ]);
        }

        $videos = video::with('order')->where('user_id', Auth::user()->id)
            ->where('id', $request->video_id)
            ->where('status', '!=', config('constants.video_approved'))
            ->first();

        if ($videos) {
            $videos->status = config('constants.video_reject');
            $videos->save();

            $email_parts = explode('@', $videos->email);
            $name = $email_parts[0];
            $customerName = $videos->order
                ? ($videos->order->customer_name ?: '')
                : '';
            // $details = [
            //     'rejectionReason' => $request->reason,
            //     'mail' => $videos->email,
            //     'name' => $name,
            //     'storename' => Auth::user()->store_name,
            //     'storeteam' => Auth::user()->name,
            //     'url' => env('APP_URL') . "/landingPage" . "/" . Auth::user()->settings->locale . "?store=" . Auth::user()->name,
            //     'locale' => $user->settings->locale,
            // ];

            //dispatch(new NotApprovedMailjob($details));

            $temlateDetails['user_id'] = Auth::user()->id;
            $temlateDetails['type'] = 'UGC_Declined';
            $temlateDetails['view'] = 'emails.ugc_declined';
            $temlateDetails['mail'] = $videos->email;
            $temlateDetails['name'] = $customerName;
            $temlateDetails['storename'] = auth()->user()->store_name;
            $temlateDetails['amount'] = Auth::user()->settings->store_credit;
            $temlateDetails['url'] = env('APP_URL') . "/landingPage" . "/" . Auth::user()->settings->locale . "?store=" . Auth::user()->name;
            $temlateDetails['discount_code'] = '';
            $temlateDetails['reason_decline'] = $request->reason;
            $email_status = Setting::where('user_id', $user->id)->first()->email_status;
            if ($email_status != 'false') {
                dispatch(new EmailTemplateJob($temlateDetails));
            } else {
                $klavio = KlavioCredential::where('user_id', $user->id)->first();
                dispatch(new KlavioEmailJob($klavio->api_key, $klavio->email, null, $temlateDetails, $videos->id));
            }

            $log_details = [
                'type' => "EMAIL",
                'send_to' => $videos->email,
                'user_id' => $user->id,
                'customer_name' => $customerName,
                'customer_email' => $videos->email,
                'email_type' => config('constants.video_reject'),
            ];
            update_log_file($log_details);

            SendMantleEventJob::dispatch($user, config('constants.video_reject'), $log_details);

            //dispatch(new videoMail($details));

            $updateUser = User::find(Auth::user()->id);
            $updateUser->remaining_email = $remainingEmail - 1;
            $updateUser->remaining_videos = $remainingVideos - 1;
            $updateUser->save();

            return response()->json([
                'success' => true,
                'message' => 'Status Changed Successfully',
                'data' => null,
            ]);
        }
        return response()->json([
            'success' => false,
            'message' => 'Something Went Wrong',
        ]);
    }
    /****** get Approved videos  ********/
    public function getApprovedVideos(Request $request)
    {
        if ($request->filled('id')) {
            $user = User::find($request->id);
            $page = $request->currentPage;
            if (!$user) {
                return redirect()->to('admin-dashboard');
            }
        } else {
            $page = $request->page;
            $user = Auth::user();
        }

        $videosPerPage = 4;
        $limit = $page * $videosPerPage;
        $totalVideos = video::where('user_id', $user->id)
            ->where('status', '=', config('constants.video_approved'))
            ->count();
        $totalPages = ceil($totalVideos / $videosPerPage);
        $videos = video::where('user_id', $user->id)
            ->where('status', '=', config('constants.video_approved'))->orderBy('id', 'DESC')
            ->get()->take($limit);
        return response()->json([
            'success' => true,
            'message' => 'Fetch Approved Videos Successfully',
            'data' => $videos,
            'totalPages' => $totalPages,
            'videosCount' => $totalVideos
        ]);
    }

    public function testUp(Request $request)
    {
        return response()->json([
            'success' => false,
            'message' => 'Something Went Wrong',
            'data' => $request->all()
        ]);
    }
    public function sendTest(Request $request)
    {
        return response()->json([
            'success' => false,
            'message' => 'Something Went Wrong',
            'data' => $request->all()
        ]);
    }

    // test function
    public function test(Request $request)
    {
        $email_count = Plan::where('id', auth()->user()->plan_id)->first();
        $charge = Charge::where('user_id', auth()->user()->id)
            ->where('status', '=', 'ACTIVE')
            ->first();
        $current_user_approved_video_count = Video::where("user_id", auth()->user()->id)->where('status', config('constants.video_approved'))
            ->where('created_at', '>=', $charge->billing_on)
            ->where('created_at', '<=', Carbon::now())
            ->get();
        $current_user_approved_video_count = Video::where("user_id", auth()->user()->id)->where('status', config('constants.video_approved'))->whereMonth('created_at', Carbon::now()->month)->count();
        $dropbox = updateDropboxToken();
        $token = 'Bearer ' . $dropbox['access_token'];
        try {
            $client = new Client();
            $response = $client->post('https://api.dropboxapi.com/2/files/get_temporary_link', [
                'headers' => [
                    'Authorization' => $token
                ],
                'json' => [
                    'path' => '/vidial/1678351912.mp4',
                ],
            ]);
            $videoLink = json_decode($response->getBody()->getContents(), true)['link'];
            dd($videoLink);
        } catch (\Exception $e) {
            Log::error('An error occurred: ' . $e->getMessage());
        }

        try {
            $token = "Bearer sl.BZnaalQHjOM-wadrKh4Ek2Cxtp0lt1REIp7_wNMOu2OJWbUrgwzU8OyGErBf8HPeernpeIjyKVjXtrwbvzzPgXjvvF2NU4AEHqK0013EtI_W9JDnW_dbCGN4v0f3ijGwI3RqQBAi";
            $client = new Client();
            $response = $client->post('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', [
                'headers' => [
                    'Authorization' => $token,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'path' => '/testing/testing2.mp4',
                    'settings' => [
                        'requested_visibility' => [
                            '.tag' => 'public',
                        ],
                    ],
                ]
            ]);
            $videoLink = json_decode($response->getBody()->getContents(), true)['url'];
            $replaced = str_replace("www.dropbox.com", "dl.dropboxusercontent.com", $videoLink);
        } catch (\Exception $e) {
            Log::error('An error occurred: ' . $e->getMessage());
        }
        return;
    }
    //  Generating Unique Discount Code
    public function generateUniqueDiscountCode()
    {
        $code = substr(base_convert(sha1(uniqid(mt_rand())), 16, 36), 0, 10);
        return $code = 'GA' . $code;
    }

    // Get Date and Time
    public function dateAndTime()
    {
        $date = new DateTime(Carbon::now(), new DateTimeZone('-05:00'));
        $formattedDate = $date->format('c');
        return $formattedDate;
    }

    // Upload video on dropbox
    public function uploadDropboxVideo(Request $request)
    {

        $file = $request->file('files')[0];
        $dropbox = updateDropboxToken();
        $token = 'Bearer ' . $dropbox['access_token'];

        try {
            $client = new Client([
                'headers' => [
                    'Authorization' => $token,
                    'Content-Type' => 'application/octet-stream',
                    'Dropbox-API-Arg' => json_encode([
                        'path' => '/vidial/' . time() . '.' . $file->extension(),
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
        if (isset($data['path_display']) && !empty($data['path_display'])) {
            try {
                $client = new Client();
                $response = $client->post('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', [
                    'headers' => [
                        'Authorization' => $token,
                        'Content-Type' => 'application/json',
                    ],
                    'json' => [
                        'path' => $data['path_display'],
                        'settings' => [
                            'requested_visibility' => [
                                '.tag' => 'public',
                            ],
                        ],
                    ]
                ]);
                $videoLink = json_decode($response->getBody()->getContents(), true)['url'];
                $videoLink = str_replace("www.dropbox.com", "dl.dropboxusercontent.com", $videoLink);
                $videoContent['link'] = $videoLink;
                $videoContent['path'] = $data['path_display'];
            } catch (\Exception $e) {

                Log::error('An error occurred: ' . $e->getMessage());
            }
        }
        return response()->json([
            'success' => true,
            'message' => 'Video Uploaded Successfully',
            'data' => $videoContent
        ]);
    }
    public function saveVideo(Request $request)
    {

        /****** check link expiration ******/

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

        $order = null;
        $order_id = null;
        if ($request->filled('order_id')) {
            try {
                $order_id = Crypt::decryptString($request->order_id);
                $order = Orders::find($order_id);

                // check order existance
                if (!$order) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Path not found',
                    ], 404);
                }
                // check replied or not
                if ($order->replied) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Link expired',
                    ], 419);
                }
            } catch (\Illuminate\Contracts\Encryption\DecryptException $e) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage(),
                ], 500);
            }
        }

        $video['video_link'] = $request->video_link;
        $video['email'] = $request->email;
        $video['status'] = config('constants.video_pending');
        $video['path'] = $request->video_path;
        $video['order_id'] = $order_id;
        $user = User::where('name', $request->store)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Store not found',
            ]);
        }
        $video['user_id'] = $user->id;
        if (Video::create($video)) {
            if ($order) {
                $order->replied = 1;
                $order->save();
            }
            // send email Portion
            $details = [
                'mail' => $user->email,
                'locale' => $user->settings->locale,
                // 'url' => "https://" . $user->name . "/" . "admin",
                'url' => "https://admin.shopify.com/store/" . trim(str_replace('.myshopify.com', '', $user->name)) . "/apps/" . trim($_ENV['APP_NAME']) . "/videos-to-review"

            ];
            dispatch(new ThanksMailjob($details));
            // dd('hello');

            $log_details = [
                'type' => "EMAIL",
                'send_to' => $request->email,
                'user_id' => $user->id,
                'email_type' => config('constants.thanks_mail'),
            ];
            $customer = Customer::where('email', $request->email)->first();
            if ($customer) {
                // $log_details['customer_id'] = $customer->customer_id;
                $log_details['customer_name'] = $customer->first_name . ' ' . $customer->last_name;
                $log_details['customer_email'] = $customer->email;
            } else{
                $log_details['customer_name'] = 'Name not given';
                $log_details['customer_email'] = $request->email;

            }
            update_log_file($log_details);


            return response()->json([
                'success' => true,
                'message' => 'Video Uploaded Successfully',
                'data' => ['locale' => $user->settings->locale]
            ]);
        }
        return response()->json([
            'success' => false,
            'message' => 'Something went wrong',
        ]);
    }

    // create discount code

    public function createDiscountCode($type)
    {
        $shop = Auth::user();
        $shop = User::find($shop->id);
        $settings = Setting::where('user_id', Auth::user()->id)->first();
        $discount_amount = ($type == 'star_rating') ? $settings->star_credit : $settings->store_credit;
        $discountCodeCreateQuery = <<<GRAPHQL
        mutation discountCodeBasicCreate(\$basicCodeDiscount: DiscountCodeBasicInput!) {
          discountCodeBasicCreate(basicCodeDiscount: \$basicCodeDiscount) {
        
            codeDiscountNode {
              codeDiscount {
                ... on DiscountCodeBasic {
                  title
                  codes(first: 10) {
                    nodes {
                      id
                      code
                    }
                  }
                  startsAt
                  endsAt
                  minimumRequirement {
                    ...on DiscountMinimumQuantity {
                       greaterThanOrEqualToQuantity
                    }
                  }
                  customerSelection {
                    ... on DiscountCustomerAll {
                      allCustomers
                    }
                  }
                  customerGets {
                    value {
                      ... on DiscountPercentage {
                        percentage
                      }
                    }
                    items {
                      ... on AllDiscountItems {
                        allItems
                      }
                    }
                  }
                  appliesOncePerCustomer
                }
              }
            }
            userErrors {
              field
              code
              message
            }
          }
        }
        GRAPHQL;
        $createDiscountCode = $shop->api()->graph($discountCodeCreateQuery, [
            'basicCodeDiscount' => [
                'title' => "goodauthentic_code",
                "code" => $this->generateUniqueDiscountCode(),
                "combinesWith" => [
                    "orderDiscounts" => true,
                    "productDiscounts" => true,
                    "shippingDiscounts" => true
                ],
                "startsAt" => Carbon::now()->toIso8601String(),
                "customerSelection" => [
                    "all" => true
                ],
                "customerGets" => [
                    "value" => [
                        "discountAmount" => [
                            "amount" => (float) $discount_amount,
                            "appliesOnEachItem" => false
                        ]
                    ],
                    "items" => [
                        "all" => true
                    ]
                ],
                "appliesOncePerCustomer" => true,
                "usageLimit" => 1
            ]
        ]);
        if (isset($createDiscountCode['body']['data']['discountCodeBasicCreate']['codeDiscountNode']['codeDiscount']['codes']['nodes'])) {
            $dicount_code = $createDiscountCode['body']['data']['discountCodeBasicCreate']['codeDiscountNode']['codeDiscount']['codes']['nodes'];
        } else {
            Log::info(json_encode($createDiscountCode['body'], JSON_PRETTY_PRINT));
        }
        return $dicount_code;
    }

    /**** congratulations page ******/
    public function congratulations(Request $request, $locale)
    {

        if ($request->filled('store')) {
            setLan($locale);
            $user = User::with('settings')->select('id')->where('name', $request->store)->first();

            $store = $request->store;
            if (!$user) {

                return abort(404);
            }
            $current_user_id = $user->id;
            return view('landingPage.congratulations', compact('current_user_id', 'store', 'user'));
        }
        return abort(404);
    }

    /**** Download Video ******/
    public function downloadVideo(Request $request)
    {

        $dropbox = updateDropboxToken();
        $token = 'Bearer ' . $dropbox['access_token'];
        try {
            $client = new Client();
            $response = $client->post('https://api.dropboxapi.com/2/files/get_temporary_link', [
                'headers' => [
                    'Authorization' => $token
                ],
                'json' => [
                    'path' => $request->video_path,
                ],
            ]);
            $videoLink = json_decode($response->getBody()->getContents(), true)['link'];
            $data['link'] = $videoLink;
            return response()->json([
                'success' => true,
                'message' => 'Request Successfull',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            Log::error('An error occurred: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Something went wrong',
                'data' => null
            ]);
        }
    }

    /***** terms_and_conditions *****/

    public function termsAndConditions()
    {
        return view('landingPage.terms_and_conditons');
    }
}
