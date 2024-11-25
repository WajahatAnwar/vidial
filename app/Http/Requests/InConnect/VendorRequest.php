<?php

namespace App\Http\Requests\InConnect;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class VendorRequest extends FormRequest
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
            'name' => 'required',
            'shopify_vendors.*.value' => 'required',
            'intact_vendor.value' => 'required',
            'intact_location.value' => 'required',
            'intact_department.value' => 'required',
            'shipping_method' => 'required',
            'address.address_line_1' => 'required',
            'address.address_line_2' => 'nullable',
            'address.city' => 'required',
            'address.state' => 'required',
            'address.zip_code' => 'required',
            'po_prefix' => 'required',
            'username' => 'nullable',
            'password' => 'nullable',
            'product_data_endpoint' => 'nullable|url:http,https',
            'purchase_order_endpoint' => 'nullable|url:http,https',
            'pricing_and_configuration_endpoint' => 'nullable|url:http,https',
            'invoice_endpoint' => 'nullable|url:http,https',
            'shipment_endpoint'=>'nullable|url:http,https'
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
            'name.required' => 'Vendor name is required',
            'shopify_vendors.*.value.required' => 'Shopify Vendor is required',
            'intact_vendor.value.required' => 'Intacct Vendor is required',
            'intact_location.value.required' => 'Intacct location is required',
            'intact_department.value.required' => 'Intacct department is required',
            'shipping_method.required' => 'Shipping Method is required',
            'address.address_line_1.required' => 'Address line 1 is required',
            'address.city.required' => 'City is required',
            'address.state.required' => 'State is required',
            'address.zip_code.required' => 'Zip code is required',
            'po_prefix.required' => 'PO prefix is required',
            'username.required' => 'Username is required',
            'password.required' => 'Password is required',
            'product_data_endpoint.required' => 'Product data endpoint is required',
            'product_data_endpoint.url' => 'Product data endpoint must be a valid URL',
            'purchase_order_endpoint.required' => 'Purchase order endpoint is required',
            'purchase_order_endpoint.url' => 'Purchase order endpoint must be a valid URL',
            'pricing_and_configuration_endpoint.required' => 'Pricing and configuration endpoint is required',
            'pricing_and_configuration_endpoint.url' => 'Pricing and configuration endpoint must be a valid URL',
            'invoice_endpoint.required' => 'Invoice endpoint is required',
            'invoice_endpoint.url' => 'Invoice endpoint must be a valid URL',
            'shipment_endpoint.url' => 'Shipment endpoint must be a valid URL',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(simpleValidate($validator));
    }
}
