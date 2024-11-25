<?php

namespace App\Http\Controllers\InConnect;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\AllInOne\User;
use App\Models\InConnect\EmailTag;
use App\Http\Controllers\Controller;
use App\Models\InConnect\EmailTemplate;
use Illuminate\Support\Facades\Validator;
use App\Models\InConnect\InconnectOrderStatus;

class EmailTemplateController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Applications/InConnect/Emails/Emails', [
            'email_templates' => EmailTemplate::with('inconnectOrderStatus')->get(),
            'email_tags' => EmailTag::all(),
            'order_statuses' => InconnectOrderStatus::where('id' , '!=' , 1)->get(),
            'users'=> User::whereNotNull('password')->whereRoleId(2)->orderBy('store_name', 'asc')->get(),
            // 'users' => User::whereNotNull('password')->where('role_id', 2)->orderBy('store_name', 'desc')->get();
            
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'subject' => 'required',
            'body' => 'required',
            'inconnect_order_status_id' => 'required',
            'send_at' => 'required|in:initiated,completed',
            'send_after' => 'required|numeric',
        ]);

        if ($validator->fails())
            return simpleValidate($validator);

        $data = $request->all();
        $data['ignore_users'] = $request->ignore_users ? $request->ignore_users : null;
        EmailTemplate::create($data);

        return responseJson(true, 'Email Template created successfully!', null);
    }

    public function update(EmailTemplate $emailTemplate, Request $request)
    {
        if($request->has('is_active')){
            $emailTemplate->update(['is_active' => $request->is_active]);
            return responseJson(true, $emailTemplate->name . ' updated successfully!', null);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'subject' => 'required',
            'body' => 'required',
            'inconnect_order_status_id' => 'required',
            'send_at' => 'required|in:initiated,completed',
            'send_after' => 'required|numeric',
        ]);

        if ($validator->fails())
            return simpleValidate($validator);

        $data = $request->all();
        $data['ignore_users'] = $request->ignore_users ? json_encode($request->ignore_users) : null;
        $emailTemplate->update($data);

        return responseJson(true, $emailTemplate->name . ' updated successfully!', null);
    }
}
