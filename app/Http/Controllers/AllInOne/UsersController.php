<?php

namespace App\Http\Controllers\AllInOne;

use App\Http\Controllers\Controller;
use App\Models\AllInOne\Application;
use App\Models\AllInOne\ApplicationStatus;
use App\Models\AllInOne\InconnectApplicationStatus;
use App\Models\AllInOne\PunchoutApplicationStatus;
use App\Models\AllInOne\User;
use App\Models\Punchout\AccessLevel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use \Illuminate\Support\Str;

class UsersController extends Controller
{
    public function get_all_users(Request $request)
    {
        $users = User::whereIn('role_id', [3, 4])->get();
        $applications = Application::get();

        foreach ($applications as $key => $application) {
            foreach ($users as $key => $user) {
                ApplicationStatus::updateOrCreate(
                    ['user_id' => $user->id, 'application_id' => $application->id],
                    ['user_id' => $user->id, 'application_id' => $application->id]
                );
            }
        }

        $users = User::with(['applications'])->whereIn('role_id', [3, 4])
            ->when($request->get('q'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->orWhere('name', 'LIKE', '%' . $request->q . '%');
                    $q->orWhere('email', 'LIKE', '%' . $request->q . '%');
                    $q->orWhere('store_name', 'LIKE', '%' . $request->q . '%');
                });
            })->when($request->get('q5'), function ($q) use ($request) {
                $q->when($request->get('q5') == "id asc", function ($q) {
                    $q->orderBy("id", "asc");
                });
                $q->when($request->get('q5') == "id desc", function ($q) {
                    $q->orderBy("id", "desc");
                });
                $q->when($request->get('q5') == "name asc", function ($q) {
                    $q->orderBy("name", "asc");
                });
                $q->when($request->get('q5') == "name desc", function ($q) {
                    $q->orderBy("name", "desc");
                });
                $q->when($request->get('q5') == "email asc", function ($q) {
                    $q->orderBy("email", "asc");
                });
                $q->when($request->get('q5') == "email desc", function ($q) {
                    $q->orderBy("email", "desc");
                });
            })->cursorPaginate($request->page_count);

        $applications = Application::select('*', 'name as title')->get();

        return responseJson(true, 'Users list shown', $users, $applications);
    }

    public function add_new_user(Request $request)
    {
        // Validate the input data
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
        ];

        // Validate the input data
        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails())
            return simpleValidate($validator);

        $user_role = json_decode($request->user_role);
        $access_level = json_decode($request->access_level);

        // Create the user
        $user = new User();
        $user->name = $request->input('name');
        $user->email = $request->input('email');
        $user->password = Hash::make($request->input('password'));
        $user->role_id = $user_role->value;
        if ($user_role->value == 4) {
            $user->access_level_id = $access_level->value;
        }
        $user->save();

        return responseJson(true, 'User created successfully');
    }

    public function delete_user(Request $request)
    {
        $user = User::find($request->id);

        if (!$user) {
            return responseJson(false, 'User not found');
        }

        $user->delete();

        return responseJson(true, 'User deleted successfully');
    }

    public function reset_password(Request $request)
    {
        // Define validation rules
        $rules = [
            'password' => 'required|string|min:8',
        ];

        // Validate the input data
        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails())
            return simpleValidate($validator);

        $user = User::find($request->id);

        if (!$user) {
            return responseJson(false, 'User not found');
        }

        // Update the password
        $user->password = Hash::make($request->input('password'));
        $user->save();

        return responseJson(true, 'Password changed successfully');
    }

    public function edit_user(Request $request)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $request->id,
        ];

        // Validate the input data
        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails())
            return simpleValidate($validator);

        $user = User::find($request->id);

        if (!$user) {
            return responseJson(false, 'User not found');
        }

        $user_role = json_decode($request->user_role);
        $access_level = json_decode($request->access_level);

        // Update user information
        $user->name = $request->input('name');
        $user->email = $request->input('email');
        $user->role_id = $user_role->value;
        if ($user_role->value == 4) {
            $user->access_level_id = $access_level->value;
        }
        $user->save();

        return responseJson(true, 'User updated successfully');
    }

    public function getUserData(Request $request)
    {
        $user = User::with(['applications.pivot.inconnect', 'applications.pivot.punchout'])->where('id', $request->user)->first();
        $tabs = [
            'Goosely' => [
                'Shopify Accounts',
                'Vendors',
                'Decorators'
            ],
            'Punchout' => [
                'Custom Quote',
                'Discount Code',
                'Product Quantity'
            ]
        ];
        foreach ($user->applications as $key => $application) {
            if ($application->name == 'Goosely') {
                foreach ($tabs[$application->name] as $type) {
                    InconnectApplicationStatus::updateOrCreate(
                        [
                            'application_status_id' => $application->pivot->id,
                            'type' => $type
                        ]
                    );
                }
            }

            if ($application->name == 'Punchout') {
                foreach ($tabs[$application->name] as $type) {
                    PunchoutApplicationStatus::updateOrCreate(
                        [
                            'application_status_id' => $application->pivot->id,
                            'type' => $type
                        ]
                    );
                }
            }
        }
        $levels = AccessLevel::all();

        return response()->json([
            'success' => true,
            'message' => 'User Data Retrieved',
            'user' => $user,
            'accessLevels'=>$levels
        ]);
    }

    public function changeReadWrite(Request $request)
    {
        $application_status = ApplicationStatus::find($request->application_status_id);

        if (!$application_status) {
            return responseJson(false, 'Application status not found');
        }

        $application_status->read_access = ($request->read_access == 'true' ? 1 : 0);
        $application_status->write_access = ($request->write_access == 'true' ? 1 : 0);
        $application_status->save();

        if (isset($request->inconnect)) {
            foreach (json_decode($request->inconnect_statuses) as $key => $value) {
                $setting = InconnectApplicationStatus::where('application_status_id', $request->application_status_id)
                    ->where('type', $value->name)->first();
                $setting->read_access = $value->read_access;
                $setting->write_access = $value->write_access;
                $setting->save();
            }
        }

        if (isset($request->punchout)) {
            foreach (json_decode($request->punchout_statuses) as $key => $value) {
                $setting = PunchoutApplicationStatus::where('application_status_id', $request->application_status_id)
                    ->where('type', $value->name)->first();
                $setting->read_access = $value->read_access;
                $setting->write_access = $value->write_access;
                $setting->save();
            }
        }

        return responseJson(true, 'Read/Write Successfully Updated');
    }

    public function regenerateToken(Request $request)
    {
        $user = User::where('id', $request->user_id)->first();

        if ($request->command == "generate") {
            $user->tokens()->delete();
            $token = $user->createToken(Str::random(0));
            $user->access_token = $token->plainTextToken;
            $user->save();
            return responseJson(true, 'Token regenerated successfully and copied to clipboard', $user);
        } else if ($request->command == "revoke") {
            $user->tokens()->delete();
            $user->access_token = null;
            $user->save();
            return responseJson(true, 'Token revoked Sucessfully');
        }
    }

    public function accessLevels()
    {
        $levels = AccessLevel::all();
        $data['access_levels'] = $levels;
        return responseJson(true, 'Access levels', $data);
    }
}
