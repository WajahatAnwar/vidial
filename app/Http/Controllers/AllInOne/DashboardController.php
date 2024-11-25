<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\SyncOrdersJob;
use App\Jobs\SyncProductsJob;
use App\Models\Application;
use App\Models\ApplicationStatus;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function get_dashboard(Request $request)
    {
        $users = User::where('role_id', 2)->get();
        $applications = Application::get();

        foreach ($applications as $key => $application) {
            foreach ($users as $key => $user) {
                ApplicationStatus::updateOrCreate(
                    ['user_id' => $user->id, 'application_id' => $application->id],
                    ['user_id' => $user->id, 'application_id' => $application->id]
                );
            }
        }

        $products = User::with(['applications'])->where('role_id', 2)
            ->when($request->get('q'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->orWhere('name', 'LIKE', '%' . $request->q . '%');
                    $q->orWhere('email', 'LIKE', '%' . $request->q . '%');
                    $q->orWhere('store_name', 'LIKE', '%' . $request->q . '%');
                });
            })->when($request->get('q4'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->orWhere('name', 'LIKE', '%' . $request->q4 . '%');
                    $q->orWhere('email', 'LIKE', '%' . $request->q4 . '%');
                    $q->orWhere('store_name', 'LIKE', '%' . $request->q4 . '%');
                });
            })->when($request->get('q5'), function ($q) use ($request) {
                $q->when($request->get('q5') == "id asc", function ($q) {
                    $q->orderBy("id", "asc");
                });
                $q->when($request->get('q5') == "id desc", function ($q) {
                    $q->orderBy("id", "desc");
                });
                $q->when($request->get('q5') == "store asc", function ($q) {
                    $q->orderBy("store_name", "asc");
                });
                $q->when($request->get('q5') == "store desc", function ($q) {
                    $q->orderBy("store_name", "desc");
                });
            })->cursorPaginate($request->page_count);

        $applications = Application::select('*', 'name as title')->get();

        if (Auth::user()->role_id == 3) {

            $user_id = Auth::user()->id;

            $applications = Application::with('statuses')->whereHas('statuses', function ($q) use ($user_id) {
                $q->where('status', true)->where('user_id', $user_id);
            })->select('*', 'name as title')->get();
        }

        return responseJson(true, 'Variants retrieved successfully!', $products, $applications);
    }

    public function change_status(Request $request)
    {
        // return $request;
        // if($request->application == "virtual_options")
        $user= User::where('id',$request->user_id)->where('role_id',4)->first();
        if($user){
            $app = Application::where('id',$request->application_id)->where('name', 'Punchout')->first();
            if(!$app){
                return responseJson(false, 'This is a just a punchout user');
            }
        }
        if(!$request->application_id) {
            $user = User::find($request->user_id);
            $user->show_inventory = $request->status;
            $user->save();
            return responseJson(true, 'Inventory Show/Hide status updated Successfully');
        }

        $status = ApplicationStatus::where('user_id', $request->user_id)->where('application_id', $request->application_id)->first();

        if ($status) {
            $status->status = $request->status;
            $status->save();

            return responseJson(true, 'Status Updated Successfully');
        }
    }

    public function sync_store_products(Request $request)
    {
        // return $request;

        $user = User::find($request->user_id);
        SyncProductsJob::dispatch($user, $request->intacctSync);
        return responseJson(true, 'Sync Call Done');
    }

    public function sync_store_orders(Request $request)
    {
        // return $request;

        $user = User::find($request->user_id);
        SyncOrdersJob::dispatch($user);
        return responseJson(true, 'Sync Call Done');
    }
}
