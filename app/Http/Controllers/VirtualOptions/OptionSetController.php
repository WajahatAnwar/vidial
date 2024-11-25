<?php

namespace App\Http\Controllers\VirtualOptions;

use App\Http\Controllers\Controller;

use App\Jobs\VirtualOptions\ChargesProductCreateJob;
use App\Jobs\VirtualOptions\ChargesProductDeleteJob;
use App\Jobs\VirtualOptions\DropdownProductCreateJob;
use App\Jobs\VirtualOptions\DropdownProductDeleteJob;
use App\Jobs\VirtualOptions\InputFieldProductCreateJob;
use App\Jobs\VirtualOptions\InputFieldProductDeleteJob;
use App\Models\VirtualOptions\AdminNoteDetail;
use App\Models\VirtualOptions\Condition;
use App\Models\VirtualOptions\DropdownDetail;
use App\Models\VirtualOptions\DropdownFamily;
use App\Models\VirtualOptions\Family;
use App\Models\VirtualOptions\FileUploadDetail;
use App\Models\VirtualOptions\InputFieldDetail;
use App\Models\VirtualOptions\Logo;
use App\Models\VirtualOptions\LogoGroup;
use App\Models\VirtualOptions\LogoGroupDetail;
use App\Models\VirtualOptions\Option;
use App\Models\VirtualOptions\OptionAssignedSet;
use App\Models\VirtualOptions\OptionSet;
use App\Models\VirtualOptions\OptionType;
use App\Models\AllInOne\Product;
use App\Models\VirtualOptions\TextareaDetail;
use App\Models\AllInOne\User;
use App\Models\VirtualOptions\InputFieldThread;
use App\Models\VirtualOptions\ThreadColorFamily;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class OptionSetController extends Controller
{
    public function options_list_sort(Request $request)
    {
        $options = OptionAssignedSet::with(['option_sort.option_type'])
            ->when($request->get('option_set_id'), function ($q) use ($request) {
                $q->where('option_set_id', $request->option_set_id);
            })->orderBy('sort_number', 'asc')->get();
        return sendResponse(true, 'Options retrieved successfully!', $options);
    }

    public function options_list(Request $request)
    {
        $rules = Option::with(['option_sets', 'option_type'])
            ->when($request->get('q'), function ($q) use ($request) {
                $q->where('options.id', 'LIKE', '%' . $request->q . '%');
                $q->orWhere(function ($q) use ($request) {
                    $q->where('option_name', 'LIKE', '%' . $request->q . '%')
                        ->orWhereHas('option_type', function ($q) use ($request) {
                            $q->where('option_types.name', 'LIKE', '%' . $request->q . '%');
                        });
                });
            })->when($request->get('q2'), function ($q) use ($request) {
                $q->whereHasIn('option_sets', function ($q) use ($request) {
                    $q->whereIn('option_sets.id', json_decode($request->q2));
                });
            })->when($request->get('option_set_id'), function ($q) use ($request) {
                $q->whereHasIn('option_sets', function ($q) use ($request) {
                    $q->where('option_sets.id', $request->option_set_id);
                });
            })->when($request->get('option_set_id_two'), function ($q) use ($request) {
                // $q->whereDoesntHaveIn('option_sets');
                $q->whereHasIn('option_sets', function ($q) use ($request) {
                    $q->where('option_sets.id', $request->option_set_id_two);
                }, '=', 0);
            })->cursorPaginate($request->page_count ? $request->page_count : 100);
        return sendResponse(true, 'Options retrieved successfully!', $rules);
    }

    public function options_sets_list()
    {
        $option_sets = OptionSet::orderBy('name', 'asc')->get();
        return sendResponse(true, 'Option sets recieved', $option_sets);
    }

    public function get_option_set_editing_data(Request $request)
    {
        $option_set = OptionSet::find($request->editing_id);
        return sendResponse(true, 'Option Set data shown',  $option_set);
    }

    public function update_option_set_name(Request $request)
    {
        if (!isset($request->name))
            return sendResponse(false, 'The name field is required.');

        $update_option_set = OptionSet::find($request->editing_id);
        $update_option_set->name = $request->name;
        $update_option_set->save();

        return sendResponse(true, 'Option Set name Updated.');
    }

    public function delete_option_set(Request $request)
    {
        $option_set = OptionSet::find($request->editing_id);
        $option_set->delete();

        return sendResponse(true, 'Option Set deleted and Its assigned options are Unassigned');
    }

    public function add_option_set(Request $request)
    {
        $validator = Validator::make($request->all(), ['name' => 'required'], []);

        if ($validator->fails()) return simpleValidate($validator);

        $new_option_set = new OptionSet;
        $new_option_set->name = $request->name;
        $new_option_set->save();

        return sendResponse(true, 'New Option Set Added.');
    }

    public function options_sets_table(Request $request)
    {
        $rules = OptionSet::when($request->get('q'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->where('name', 'LIKE', '%' . $request->q . '%');
            });
        })->cursorPaginate(5);
        return sendResponse(true, 'Options Set retrieved successfully!', $rules);
    }

    public function get_add_option_data(Request $request)
    {
        $option_types = OptionType::get();
        $logo_groups = LogoGroup::get();
        $option_sets = OptionSet::get();
        $families = Family::get();
        $options = Option::get();

        $object['data1'] =  $option_types;
        $object['data2'] =  $logo_groups;
        $object['data3'] =  $option_sets;
        $object['data4'] =  $families;
        $object['data5'] =  $options;

        return sendResponse(true, 'Add option required data shown', $object);
    }

    public function get_logo_group_logos(Request $request)
    {
        // return $request;

        $logos = Logo::with(['groups'])->whereHasIn('groups', function ($q) use ($request) {
            $q->where('logo_groups.id', $request->logo_group_id);
        })->get();

        return sendResponse(true, 'Logo shown for specific group', $logos);
    }


    public function add_option(Request $request)
    {
        // return $request;

        $dropdown_options = json_decode($request->dropdown_options);
        // $pre_select_dropdown = json_decode($request->pre_select_dropdown);
        $logo_group_options = json_decode($request->logo_group_options);
        $option_conditions = json_decode($request->option_conditions);
        $option_type = json_decode($request->option_type);
        $selected_logo_group = json_decode($request->selected_logo_group);
        $selected_extensions = json_decode($request->selected_extensions);
        $input_fields = json_decode($request->input_fields);
        $option_sets = json_decode($request->selected_option_sets);
        $conditions_list = json_decode($request->conditions_list);
        $drop_down_families = json_decode($request->drop_down_families);
        // return $drop_down_families;

        if ($request->option_type == "false")
            return sendResponse(false, "Option Type is required.");

        $validator = Validator::make($request->all(), [
            'option_name' => 'required',
            'option_name_front' => 'required',
            'option_required' => 'required',
        ], []);

        if ($validator->fails()) return simpleValidate($validator);

        DB::beginTransaction();

        try {

            if ($request->update_option_id != "false") {

                // dd($request->update_option_id);

                $new_option = Option::find($request->update_option_id);
                TextareaDetail::where('option_id', $request->update_option_id)->delete();
                AdminNoteDetail::where('option_id', $request->update_option_id)->delete();
                LogoGroupDetail::where('option_id', $request->update_option_id)->delete();
                FileUploadDetail::where('option_id', $request->update_option_id)->delete();
                $input_field_delete = InputFieldDetail::where('option_id', $request->update_option_id)->get();
                foreach ($input_field_delete as $key => $del_inside) {

                    $threads = InputFieldThread::where('input_field_detail_id', $del_inside->id)->get();
                    foreach ($threads as $key => $thread_del) {
                        ThreadColorFamily::where('input_field_thread_id', $thread_del->id)->delete();
                        $thread_del->delete();
                    }
                    $del_inside->delete();
                }
            } else $new_option = new Option;

            $new_option->option_name = $request->option_name;
            $new_option->frontend_name = $request->option_name_front;
            $new_option->required = ($request->option_required === 'true');
            $new_option->option_type_id = $option_type->value;
            $new_option->conditions_status = $option_conditions->value;

            // if ($option_conditions->value) {
            //     $new_option->conditions_json = $request->conditions_list;
            // }

            $new_option->save();

            if ($option_conditions->value) {

                if ($request->update_option_id != "false") {
                    Condition::where('option_id', $request->update_option_id)->delete();
                }

                foreach ($conditions_list as $key => $con) {

                    if ($con->selectedType == false) {
                        if ($con->selectedOption == false) return sendResponse(false, "Kindly add any conditions to proceed further.");
                    } else if ($con->selectedType->value == 1 || $con->selectedType->value == 2 || $con->selectedType->value == 9) {
                        if ($con->selectedOption == false) return sendResponse(false, "Kindly select any option in conditions.");
                        if ($con->selectedOptionOption == false) return sendResponse(false, "Kindly select any option of selected option in conditions.");
                    } else if ($con->selectedType->value == 3) {
                        if ($con->selectedOption == false) return sendResponse(false, "Kindly select any option in conditions.");
                        if ($con->textAreaValue == "") return sendResponse(false, "Kindly enter anything in text field in conditions.");
                    }

                    $new_condition = new Condition;
                    $new_condition->option_id = $new_option->id;
                    $new_condition->dependent_option_id = $con->selectedOption->value;

                    if ($con->selectedType->value == 3) $new_condition->value = $con->textAreaValue;
                    else if ($con->selectedType->value == 2) $new_condition->value = $con->selectedOptionOption->value;
                    else if ($con->selectedType->value == 1) $new_condition->value = $con->selectedOptionOption->label;
                    else if ($con->selectedType->value == 9) $new_condition->value = $con->selectedOptionOption->label;

                    $new_condition->condition_type = $con->selectedCondition->value;
                    $new_condition->condition_gate = $con->selectedGate->value;
                    $new_condition->save();
                }

                // return $conditions_list;
            }

            //NOW SAVING DATA
            if ($option_type->value == 1 || $option_type->value == 9) {

                if (count($dropdown_options) == 0)
                    return sendResponse(false, "At least one option is required in dropdown.");

                foreach ($dropdown_options as $key => $value) {
                    if ($option_type->value == 9) {

                        if ($drop_down_families[$key]->image_name == false) {
                            $inside_i = $key + 1;
                            return sendResponse(false, "Image File $inside_i is required.");
                        }

                        // if (!$request->file("main_file$key")) {
                        //     $inside_i = $key + 1;
                        //     return sendResponse(false, "Image File $inside_i is required.");
                        // }
                    }
                }

                if ($request->update_option_id != "false") {
                    DropdownDetail::where('option_id', $request->update_option_id)->delete();
                }

                foreach ($dropdown_options as $key => $value) {

                    // dd($value);

                    $option = new DropdownDetail;
                    $option->option_id = $new_option->id;

                    $pre_select_dropdown = json_decode($request->pre_select_dropdown);
                    if ($pre_select_dropdown->value == $value) {
                        $option->pre_select = true;
                    }

                   // dd($drop_down_families[$key]->image_name, $drop_down_families[$key]->image_size);

                    $new_collection = collect($drop_down_families);
                    $selected_collection = $new_collection->where('option_name', $value)->first();

                    //IMAGE GRID CODE
                    if ($option_type->value == 9) {
                        if ($request->file("main_file$key")) {
                            $filename = "";
                            $file = $request->file("main_file$key");
                            $filename = time() . '-' . $file->getClientOriginalName();
                            $request->file("main_file$key")->storeAs('public/uploaded_images_two', $filename);
                            $option->image_src = 'storage/uploaded_images_two/' . $filename;
                            $option->image_name = $selected_collection->image_name;
                            $option->image_size = $selected_collection->image_size;
                        } else if ($drop_down_families[$key]->image_name) {
                            // dd($drop_down_families[$key]->edit_src);
                            $option->image_src = $selected_collection->edit_src;
                            $option->image_name = $selected_collection->image_name;
                            $option->image_size = $selected_collection->image_size;
                        }
                    }

                    $option->upcharge_amount = $selected_collection->upcharge;
                    $option->value = $value;
                    $option->save();

                    DropdownProductCreateJob::dispatch($drop_down_families[$key]->upcharge);

                    $ids = collect($drop_down_families[$key]->option_families)->pluck('value');
                    $option->families()->sync($ids);
                }
                //
            } else if ($option_type->value == 2) {

                if ($request->selected_logo_group == "false")
                    return sendResponse(false, "Kindly Select any Logo Group to assign logos.");

                foreach ($logo_group_options as $key => $value) {

                    $option = new LogoGroupDetail;
                    $option->option_id = $new_option->id;
                    $option->logo_group_id = $selected_logo_group->value;
                    $option->logo_id = $value->id;
                    $option->upcharge_amount = $value->up_charge;
                    $option->pre_select_status = $value->pre_select;
                    $option->save();

                    ChargesProductCreateJob::dispatch($value->up_charge);
                }
                //
            } else if ($option_type->value == 3) {

                // return $request->rows_required;

                if ($request->rows_required < 1)
                    return sendResponse(false, "Rows must be greater than 0.");


                if ($request->rows_required > 10)
                    return sendResponse(false, "Rows must be less then 10.");

                $option = new TextareaDetail;
                $option->option_id = $new_option->id;
                $option->rows_required = $request->rows_required;
                $option->save();
                //
            } else if ($option_type->value == 4) {

                $validator2 = Validator::make($request->all(), [
                    'upload_instructions' => 'required',
                    'upload_size' => 'required|numeric|min:0|not_in:0',
                ], []);

                if ($validator2->fails()) return simpleValidate($validator2);

                if (count($selected_extensions) == 0)
                    return sendResponse(false, "Kindly Select any extension for file.");

                $option = new FileUploadDetail;
                $option->option_id = $new_option->id;
                $option->instructions = $request->upload_instructions;
                $option->upload_size = $request->upload_size;
                $option->extensions = $request->selected_extensions;
                $option->save();
                //
            } else if ($option_type->value == 5) {

                if ($request->admin_note == "<p><br></p>")
                    return sendResponse(false, "Kindly enter anything in the admin note.");

                $option = new AdminNoteDetail;
                $option->option_id = $new_option->id;
                $option->value = $request->admin_note;
                $option->status = ($request->admin_note_send === 'true');
                $option->save();
                //
            } else if ($option_type->value == 6) {

                foreach ($input_fields as $key => $value) {

                    // dd($value->max);

                    if ($value->max < 1)
                        return sendResponse(false, "Max Characters cannot be less then 1.");

                    if (!is_numeric($value->max))
                        return sendResponse(false, "Characters count can only be numeric.");

                    if ($value->charge < 0)
                        return sendResponse(false, "Charge cannot be less then 1.");

                    if (!is_numeric($value->charge))
                        return sendResponse(false, "Charge can only be numeric.");

                    if ($value->font_size < 0.1)
                        return sendResponse(false, "Font Size cannot be less then 0.1.");

                    if (!is_numeric($value->font_size))
                        return sendResponse(false, "Font Size can only be numeric.");

                    $option = new InputFieldDetail;
                    $option->option_id = $new_option->id;
                    $option->line_no = $key + 1;
                    $option->required = $value->required;
                    $option->max_char = $value->max;
                    $option->upcharge_amount = $value->charge;
                    $option->font_json = json_encode($value->font);
                    $option->font_size = $value->font_size;
                    $option->save();

                    foreach ($value->threads as $key => $thread) {

                        if ($thread->thread_name == "")
                            return sendResponse(false, "Thread Color is required.");

                        if ($thread->thread_name == 0)
                            return sendResponse(false, "Thread Color cannot be equal to 0");

                        $new_thread = new InputFieldThread;
                        $new_thread->input_field_detail_id = $option->id;
                        $new_thread->thread_name = $thread->thread_name;
                        $new_thread->save();

                        foreach ($thread->thread_families as $key => $family) {

                            $new_thread_family = new ThreadColorFamily;
                            $new_thread_family->input_field_thread_id = $new_thread->id;
                            $new_thread_family->family_id = $family->value;
                            $new_thread_family->save();
                        }
                    }

                    InputFieldProductCreateJob::dispatch($value->charge);
                }
            }

            $option_set_ids = collect($option_sets)->pluck('value');
            $new_option->option_sets()->sync($option_set_ids);

            DB::commit();

            $message = "";
            if ($request->update_option_id != "false")
                $message = "Updated.";
            else
                $message = "Added.";

            //
            return sendResponse(true, "Virtual Option '$option_type->label' $message");
            //
        } catch (\Throwable $th) {
            return $th;
        }
    }
    //THIS
    public function assign_option_option_sets(Request $request)
    {
        $option_set_ids = json_decode($request->option_set_ids);
        $option_ids = json_decode($request->option_ids);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;

        if ($all_check == "true") {
            parse_str($search_query, $params);

            $option_ids = Option::with(['option_sets', 'option_type'])
                ->when(isset($params['q']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->where('option_name', 'LIKE', '%' . $params['q'] . '%');
                    });
                })->when(isset($params['q2']), function ($q) use ($params) {
                    $q->whereHasIn('option_sets', function ($q) use ($params) {
                        $q->whereIn('option_sets.id', json_decode($params['q2']));
                    });
                })->get()->pluck('id');
        }

        // return $request;
        // return $request->all_check;
        // return array($option_set_ids, $option_ids);

        DB::beginTransaction();
        try {

            foreach ($option_ids as $key => $option) {

                $inside_option = Option::find($option);
                $inside_option->option_sets()->sync($option_set_ids);
            }

            DB::commit();

            return sendResponse(true,  'Option sets assigned to option.');
            //
        } catch (\Exception $th) {
            return $th;
        }
    }

    //THIS
    public function delete_selected_options(Request $request)
    {
        // return $request;

        $option_ids = json_decode($request->option_ids);
        $search_query = json_decode($request->search_query);
        $all_check = $request->all_check;

        if ($all_check == "true") {
            parse_str($search_query, $params);

            $option_ids = Option::with(['option_sets', 'option_type'])
                ->when(isset($params['q']), function ($q) use ($params) {
                    $q->where(function ($q) use ($params) {
                        $q->where('option_name', 'LIKE', '%' . $params['q'] . '%');
                    });
                })->when(isset($params['q2']), function ($q) use ($params) {
                    $q->whereHasIn('option_sets', function ($q) use ($params) {
                        $q->whereIn('option_sets.id', json_decode($params['q2']));
                    });
                })->get()->pluck('id');
        }

        if (count($option_ids) == 0)
            return sendResponse(false, 'At least select one option!');

        foreach ($option_ids as $key => $value) {










            // LOGIC THREE #################################################

            $dropdown_deletes = DropdownDetail::where('option_id', $value)->get();

            //DELETING PRICES
            $arr = array();
            foreach ($dropdown_deletes as $dropdown_key => $dropdown) {
                $arr[] = $dropdown->upcharge_amount;
                DropdownFamily::where('dropdown_detail_id', $dropdown->id)->delete();
                $dropdown->delete();
            }

            // Log::info(json_encode($arr));

            $drop_down_two = DropdownDetail::get();

            $final_delete_list = array();
            foreach ($arr as $key3 => $value3) {
                $delete_check = 'true';
                foreach ($drop_down_two as $key2 => $value2) {
                    if ($value2->upcharge_amount == $value3)
                        $delete_check = 'false';
                }
                if ($delete_check == 'true')
                    $final_delete_list[] = $value3;
            }

            // Log::info(json_encode($final_delete_list));
            foreach ($final_delete_list as $key3 => $value3) {
                DropdownProductDeleteJob::dispatch($value3);
            }

            // LOGIC END THREE #############################################









            // LOGIC TWO #################################################

            // InputFieldDetail::where('option_id', $value)->delete();

            $input_detail = InputFieldDetail::where('option_id', $value)->get();

            //DELETING PRICES
            $arr = array();
            foreach ($input_detail as $key3 => $value3) {
                $arr[] = $value3->upcharge_amount;
                $threads = InputFieldThread::where('input_field_detail_id', $value3->id)->get();
                foreach ($threads as $key => $thread_del) {
                    ThreadColorFamily::where('input_field_thread_id', $thread_del->id)->delete();
                    $thread_del->delete();
                }
                $value3->delete();
            }

            $drop_down_two = InputFieldDetail::get();

            // Log::info(json_encode($arr));

            $final_delete_list = array();
            foreach ($arr as $key3 => $value3) {
                $delete_check = 'true';
                foreach ($drop_down_two as $key2 => $value2) {
                    if ($value2->upcharge_amount == $value3)
                        $delete_check = 'false';
                }
                if ($delete_check == 'true')
                    $final_delete_list[] = $value3;
            }

            // Log::info(json_encode($final_delete_list));
            foreach ($final_delete_list as $key3 => $value3) {
                InputFieldProductDeleteJob::dispatch($value3);
            }

            // LOGIC END TWO #############################################











            // LOGIC #################################################

            $logo_detail = LogoGroupDetail::where('option_id', $value)->get();

            //DELETING PRICES
            $arr = array();
            foreach ($logo_detail as $key3 => $value3) {
                $arr[] = $value3->upcharge_amount;
                $value3->delete();
            }

            $logo_detail_two = LogoGroupDetail::get();

            // Log::info(json_encode($arr));

            $final_delete_list = array();
            foreach ($arr as $key3 => $value3) {
                $delete_check = 'true';
                foreach ($logo_detail_two as $key2 => $value2) {
                    if ($value2->upcharge_amount == $value3)
                        $delete_check = 'false';
                }
                if ($delete_check == 'true')
                    $final_delete_list[] = $value3;
            }

            // Log::info(json_encode($final_delete_list));
            foreach ($final_delete_list as $key3 => $value3) {
                ChargesProductDeleteJob::dispatch($value3);
            }

            // LOGIC END #############################################









            AdminNoteDetail::where('option_id', $value)->delete();
            FileUploadDetail::where('option_id', $value)->delete();
            TextareaDetail::where('option_id', $value)->delete();
            OptionAssignedSet::where('option_id', $value)->delete();
            Option::find($value)->delete();

            Condition::where('option_id', $value)->delete();
            Condition::where('dependent_option_id', $value)->delete();
        }

        return sendResponse(true, "Selected Option's removed.");
    }

    public function remove_option(Request $request)
    {
        // return $request;

        $options_ids = json_decode($request->options_ids);

        if (count($options_ids) == 0)
            return sendResponse(false, 'At least select one logo!');

        foreach ($options_ids as $key => $value) {

            OptionAssignedSet::where('option_set_id', $request->option_set_id)
                ->where('option_id', $value)->delete();
        }

        return sendResponse(true, 'Option removed from Option Set');
    }

    public function assign_option_specific(Request $request)
    {
        // return $request;

        $options_ids = json_decode($request->options_ids);

        if (count($options_ids) == 0)
            return sendResponse(false, 'At least select one logo!');

        foreach ($options_ids as $key => $value) {

            $check = OptionAssignedSet::where('option_id', $value)->where('option_set_id', $request->option_set_id)->first();

            if (empty($check)) {
                $new_option = new OptionAssignedSet;
                $new_option->option_id = $value;
                $new_option->option_set_id = $request->option_set_id;
                $new_option->save();
            }

            // OptionAssignedSet::updateOrCreate([
            //     'option_id' => $value,
            //     'option_set_id' => $request->option_set_id,
            // ], []);
        }

        return sendResponse(true, 'Option Assigned to Option Set');
    }

    public function get_option_editing_data(Request $request)
    {
        $option = Option::find($request->option_id)->load([
            'option_type',
            'note_detail',
            'drop_detail.families',
            'file_detail',
            'input_detail.threads.thread_colors',
            'logo_detail.logo',
            'text_detail',
            'option_sets',
            'conditions.option_front.option_type',
            'conditions.option_back.option_type',
            'conditions.option_back.drop_detail',
            'conditions.option_back.text_detail',
            'conditions.option_back.logo_detail.logo',
        ]);
        return sendResponse(true, 'Get editing option data',  $option);
    }

    public function manage_new_sort(Request $request)
    {
        $rows = json_decode($request->rows);
        $ids = collect($rows)->pluck('id');

        foreach ($ids as $key => $value) {

            if ($value == 2656726567) {

                $assigned = new OptionAssignedSet;
                $assigned->sort_number = $key + 1;
                $assigned->option_set_id = $request->option_set_id;
                $assigned->extra = "Color";
                $assigned->save();
                continue;
            }

            if ($value == 7493749300) {

                $assigned = new OptionAssignedSet;
                $assigned->sort_number = $key + 1;
                $assigned->option_set_id = $request->option_set_id;
                $assigned->extra = "Size";
                $assigned->save();
                continue;
            }

            $assigned = OptionAssignedSet::find($value);
            $assigned->sort_number = $key + 1;
            $assigned->save();
        }

        return sendResponse(true, 'Sort Updated Successfully');
    }
}
