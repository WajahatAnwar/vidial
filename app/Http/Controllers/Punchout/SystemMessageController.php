<?php

namespace App\Http\Controllers\Punchout;

use App\Http\Controllers\Controller;
use App\Models\Punchout\SystemMessage;
use Illuminate\Http\Request;

class SystemMessageController extends Controller
{
    public function getSystemMessages(Request $request){

        $systemMessages = SystemMessage::limit(250)
            ->when($request->has('q'), function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->get('q') . '%');
            })
            ->when($request->has('sort'), function ($q) use ($request) {
                $q->orderBy(...explode(' ', $request->get('sort')));
        })
        ->cursorPaginate($request->page_count);
        return sendResponse(true, 'System messages retrieved successfully!', $systemMessages);
    }
}
