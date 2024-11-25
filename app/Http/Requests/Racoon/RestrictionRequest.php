<?php

namespace App\Http\Requests\Racoon;


use App\Rules\DuplicateCollectionRestriction;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class RestrictionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'id' => 'nullable',
            'name' => 'required',
            'user.value' => 'required',
            'tags.*' => 'nullable',
            'emails.*' => 'email',
            'emails' => 'array|required_without:tags',
            'collections' => [
                'required',
                'array',
                'min:1',
                new DuplicateCollectionRestriction($this->user['value'], $this->id) 
            ],
            'notifications_enabled' => 'required|boolean',
            'notification_email' => 'nullable|email|required_if:notifications_enabled,true',
        ];
    }

    /**
     * Get the validation messages that apply to the request.
     *
     * @return array<string, mixed>
     */

    public function messages()
    {
        return [
            'name.required' => 'Name is required',
            'user.value.required' => 'Store is required',
            'emails.*.email' => 'Emails must be a valid email address',
            'emails.required_without' => 'Either emails or tags must be provided',
            'collections.required' => 'One or more collections are required',
            'notifications_enabled.required' => 'Notifications enabled is required',
            'notification_email.email' => 'Notification email must be a valid email address',
            'notification_email.required_if' => 'Notification email is required if notifications enabled is true',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(simpleValidate($validator));
    }
}

