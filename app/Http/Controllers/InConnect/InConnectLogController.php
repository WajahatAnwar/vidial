<?php

namespace App\Http\Controllers\InConnect;

use App\Models\InConnect\InconnectLog;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InConnectLogController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Applications/InConnect/Logs/Logs', [
            'filter' => $request->all(),
        ]);
    }

    public function logsList(Request $request)
    {
        $logs = InconnectLog::when($request->get('q'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->when(is_numeric($request->q), function ($q) use ($request) {
                    $q->where('loggable_id', $request->q);
                })->when(!is_numeric($request->q), function ($q) use ($request) {
                    $q->orWhere('type', 'LIKE', '%' . $request->q . '%')
                    ->orWhere('description', 'LIKE', '%' . $request->q . '%');
                });
            });
        })->when($request->get('trace'), function ($q) use ($request) {
            $q->loggableType($request->trace);
        })->when($request->get('sort'), function ($q) use ($request) {
            $q->orderBy(...explode(' ', $request->get('sort')));
        })->with(['user' => function ($q) use ($request) {
            $q->when($request->get('q'), function ($q) use ($request) {
                $q->where('name', 'LIKE', '%' . $request->q . '%');
            });
        }])->cursorPaginate($request->page_count);

        return responseJson(true, 'Logs retrieved successfully!', $logs);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
