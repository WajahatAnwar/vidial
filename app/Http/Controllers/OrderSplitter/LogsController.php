<?php

namespace App\Http\Controllers\OrderSplitter;

use App\Http\Controllers\Controller;
use App\Models\AllInOne\User;
use App\Models\OrderSplitter\OrderSplitterLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LogsController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Applications/OrderSplitter/Logs/Logs', [
            'filter' => $request->all(),
        ]);
    }

    public function logsList(Request $request)
    {
        $logs = OrderSplitterLog::with(['user', 'order'])->when($request->get('q'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->when($request->q, function ($q) use ($request) {
                    $q->orWhere('type', 'LIKE', '%' . $request->q . '%')
                        ->orWhere('description', 'LIKE', '%' . $request->q . '%');
                });
            });
        })->when($request->get('q2'), function ($q) use ($request) {
            $q->whereIn('user_id', json_decode($request->get('q2')));
        })->when($request->get('type'), function ($q) use ($request) {
            $q->where('type', $request->get('type'));
        })->when($request->get('sort'), function ($q) use ($request) {
            $q->orderBy(...explode(' ', $request->get('sort')));
        })->cursorPaginate($request->page_count);

        $users = User::whereNotNull('password')->where('role_id', 2)->orderBy('store_name', 'asc')->get();

        return responseJson(true, 'Logs retrieved successfully for Order Splitter!', $logs, $users);
    }

}
