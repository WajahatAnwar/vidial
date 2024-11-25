<?php

namespace App\Http\Controllers\PurchaseOrder;

use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder\POEmail;
use Illuminate\Http\Request;

class EmailController extends Controller
{
    public function add_new_email(Request $request)
    {
        // return $request;

        $validator = Validator::make($request->all(), [
            'email_title' => 'required',
            'email_subject' => 'required',
            'email_body' => 'required',
            'senders_list' => 'required',
            'sender_type' => 'required',
        ], [
            // 'city.required' => "State field is required",
        ]);
        if ($validator->fails()) {
            $error = $validator->errors()->toArray();
            foreach ($error as $x => $x_value) {
                $err[] = $x_value[0];
            }

            return response()->json([
                'success' => false,
                'message' => $err['0'],
            ]);
        } else {
            foreach (json_decode($request->senders_list) as $key => $value) {
                if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    return response()->json([
                        'success' => false,
                        'message' => "POEmail '$value' is not a valid email",
                    ]);
                }
            }

            $new_rule = new POEmail;
            $new_rule->email_status = false;
            $new_rule->title = $request->email_title;
            $new_rule->subject = $request->email_subject;
            $new_rule->body = $request->email_body;
            $new_rule->senders_list = $request->senders_list;
            $new_rule->email_sender_type = $request->sender_type;
            $new_rule->save();

            return response()->json([
                'success' => true,
                'message' => 'New POEmail Added',
            ]);
        }
    }

    public function get_emails(Request $request)
    {
        $emails = POEmail::when($request->get('q'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->orWhere('title', 'LIKE', '%' . $request->q . '%');
                $q->orWhere('subject', 'LIKE', '%' . $request->q . '%');
                $q->orWhere('body', 'LIKE', '%' . $request->q . '%');
            });
        })->when($request->get('q5'), function ($q) use ($request) {
            $q->when($request->get('q5') == "id asc", function ($q) {
                $q->orderBy("id", "asc");
            });
            $q->when($request->get('q5') == "id desc", function ($q) {
                $q->orderBy("id", "desc");
            });
            $q->when($request->get('q5') == "name asc", function ($q) {
                $q->orderBy("title", "asc");
            });
            $q->when($request->get('q5') == "name desc", function ($q) {
                $q->orderBy("title", "desc");
            });
        })->cursorPaginate($request->page_count);

        return responseJson(true, 'Emails list shown', $emails);
    }

    public function edit_existing_email(Request $request)
    {
        // return $request;
        $validator = Validator::make($request->all(), [
            'id' => 'required',
            'email_title' => 'required',
            'email_subject' => 'required',
            'email_body' => 'required',
            'senders_list' => 'required',
            'sender_type' => 'required',
        ], [
            // 'city.required' => "State field is required",
        ]);
        if ($validator->fails()) {
            $error = $validator->errors()->toArray();
            foreach ($error as $x => $x_value) {
                $err[] = $x_value[0];
            }

            return response()->json([
                'success' => false,
                'message' => $err['0'],
            ]);
        } else {
            foreach (json_decode($request->senders_list) as $key => $value) {
                if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    return response()->json([
                        'success' => false,
                        'message' => "POEmail '$value' is not a valid email",
                    ]);
                }
            }

            $existing_email = POEmail::find($request->id);
            $existing_email->title = $request->email_title;
            $existing_email->subject = $request->email_subject;
            $existing_email->body = $request->email_body;
            $existing_email->email_sender_type = $request->sender_type;
            $existing_email->senders_list = $request->senders_list;
            $existing_email->save();

            return response()->json([
                'success' => true,
                'message' => 'Existing POEmail Updated',
            ]);
        }
    }

    public function delete_email(Request $request)
    {
        $email = POEmail::find($request->id);

        $email->delete();

        return response()->json([
            'success' => true,
            'message' => 'Existing POEmail Deleted',
        ]);
    }

    public function change_email_status(Request $request)
    {
        $existing_email = POEmail::find($request->email_id);
        $existing_email->email_status = ($request->email_status === 'true');
        $existing_email->save();

        return response()->json([
            'success' => true,
            'message' => 'Existing POEmail Status Updated',
        ]);
    }
}
