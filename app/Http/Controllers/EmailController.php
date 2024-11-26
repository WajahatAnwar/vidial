<?php

namespace App\Http\Controllers;

use App\Mail\rejectVideo;
use Illuminate\Support\Facades\Mail;

class EmailController extends Controller
{
    public  function email()
    {
        Mail::to("massab@swishtag.com")->send(new rejectVideo());
        return "email sent";
    }
}
