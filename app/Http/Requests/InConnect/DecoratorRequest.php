<?php

namespace App\Http\Requests\InConnect;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class DecoratorRequest extends FormRequest
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
        $rules['step'] = 'required|numeric';

        if($this->step >= 1){
            $rules['name'] = 'required';
            $rules['notes'] = 'nullable';
            $rules['intact_vendor.value'] = 'required';
            $rules['intact_location.value'] = 'required';
            $rules['intact_department.value'] = 'required';
            $rules['po_prefix'] = 'required';
        }

        if($this->step >= 2){
            $rules['sizes.*.name'] = 'required';
            $rules['sizes.*.shopify_sizes'] = 'required|array';
        }

        if($this->step >= 3){
            $rules['services.*.service_id'] = 'required';
            $rules['services.*.option_ids'] = 'nullable|array';
            $rules['services.*.shopify_decoration.value'] = 'required';
            // $rules['services.*.locations'] = 'required|array|min:1';
            // $rules['services.*.locations.*.location_id'] = 'required';
            // $rules['services.*.locations.*.shopify_location'] = 'required|array';
        }

        if($this->step >= 4){
            $rules['logo_phrases.*'] = 'required';
            $rules['second_logo_phrases.*'] = 'required';
            $rules['decorations.*'] = 'required';
            $rules['logo_location_phrases.*'] = 'required';
            $rules['second_logo_location_phrases.*'] = 'required';
            $rules['personalization_inputs.*'] = 'required';
        }

        if($this->step >= 5){
            $rules['address.address_line_1'] = 'required';
            $rules['address.address_line_2'] = 'nullable';
            $rules['address.city'] = 'required';
            $rules['address.state'] = 'required';
            $rules['address.zip_code'] = 'required';
            $rules['username'] = 'required';
            $rules['password'] = 'required';
            $rules['client_id'] = 'required';
            $rules['client_secret'] = 'required';
        }

        return $rules;
    }

    /**
     * Get the validation messages that apply to the request.
     *
     * @return array<string, mixed>
     */

    public function messages()
    {
        return [
            'name.required' => 'Decorator name is required',
            'notes.required' => 'Notes are required',
            'intact_vendor.value.required' => 'Intact vendor is required',
            'intact_location.value.required' => 'Intact location is required',
            'intact_department.value.required' => 'Intact department is required',
            'address.address_line_1.required' => 'Address line 1 is required',
            'address.city.required' => 'City is required',
            'address.state.required' => 'State is required',
            'address.zip_code.required' => 'Zip code is required',
            'po_prefix.required' => 'PO prefix is required',
            'sizes.*.name.required' => 'Size name is required',
            'sizes.*.shopify_sizes.required' => 'Shopify sizes are required',
            'sizes.*.shopify_sizes.array' => 'Shopify sizes must be an array',
            'services.*.service_id.required' => 'Service ID is required',
            'services.*.option_ids.required' => 'Option IDs are required',
            'services.*.option_ids.array' => 'Option IDs must be an array',
            'services.*.shopify_decoration.value.required' => 'Shopify decoration is required',
            'services.*.locations.required' => 'Locations are required',
            'services.*.locations.array' => 'Locations must be an array',
            'services.*.locations.min' => 'Locations must have at least 1 item',
            'services.*.locations.*.location_id.required' => 'Location ID is required',
            'services.*.locations.*.shopify_location.required' => 'Shopify location is required',
            'services.*.locations.*.shopify_location.array' => 'Shopify location must be an array',
            'logo_phrases.*.required' => 'Logo phrase is required',
            'second_logo_phrases.*.required' => '2nd Logo phrase is required',
            'decorations.*.required' => 'Decoration is required',
            'logo_location_phrases.*.required' => 'Logo location phrase is required',
            'second_logo_location_phrases.*.required' => '2nd Logo location phrase is required',
            'personalization_inputs.*.required' => 'Personalization input is required',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(simpleValidate($validator));
    }
}
