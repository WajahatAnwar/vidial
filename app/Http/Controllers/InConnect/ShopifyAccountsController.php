<?php

namespace App\Http\Controllers\InConnect;

use App\Http\Controllers\Controller;
use App\Models\AllInOne\Product;
use App\Models\AllInOne\User;
use App\Models\InConnect\Decorator;
use App\Models\InConnect\InconnectAccount;
use App\Models\InConnect\InconnectDecorator;
use App\Models\InConnect\InconnectDecoratorNoDataProductType;
use App\Models\InConnect\InconnectDirectVendor;
use App\Models\InConnect\InconnectFraudStatus;
use App\Models\InConnect\InconnectIgnoredProduct;
use App\Models\InConnect\InconnectIgnoredProductType;
use App\Models\InConnect\InconnectIgnoredVendors;
use App\Models\InConnect\InconnectIntactField;
use App\Models\InConnect\InconnectShipping;
use App\Models\InConnect\InconnectStatus;
use App\Models\InConnect\IntactClass;
use App\Models\InConnect\IntactCustomer;
use App\Models\InConnect\IntactDepartment;
use App\Models\InConnect\IntactPaymentTerm;
use App\Models\InConnect\IntactTransactionStatus;
use App\Models\InConnect\ProductType;
use App\Models\InConnect\ShopifyLocationField;
use App\Models\InConnect\ShopifyOrderField;
use App\Models\InConnect\ShopifyShippingField;
use App\Models\InConnect\ShopifyVendor;
use App\Models\InConnect\StoreType;
use App\Models\InConnect\Vendor;
use App\Rules\DecoratorRules;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ShopifyAccountsController extends Controller
{
    public function accountCreate(Request $request)
    {
        $excludedUserIds = DB::connection('in_connect_conn')->table('inconnect_accounts')->pluck('user_id')->toArray();

        $users = User::where('role_id', 2)->whereNotIn('id', $excludedUserIds)->get();
        $editing_account = null;
        if ($request->inconnect_account_id != "undefined") {
            $editing_account = InconnectAccount::with(['shop', 'store_type', 'decorators.pivot.shippings.shipping_origin', 'decorators.pivot.no_data_product_types.product_type', 'direct_vendors', 'ignored_vendors', 'statuses', 'fraud_statuses', 'mapping.mapping_forward', 'ignored_products.product_origin', 'intact_customer', 'intact_payment_term', 'intact_transaction_status', 'intact_department', 'intact_class', 'ignored_product_types'])->find($request->inconnect_account_id);
        }

        if ($request->inconnect_account_id != "undefined") {
            $selected_user = User::find($editing_account->user_id);
        } else if ($request->user_id) {
            $selected_user = User::find($request->user_id);
        } else if (count($users) > 0) {
            $selected_user = $users[0];
        } else {
            $selected_user = false;
        }

        $object = [
            'users' => $users,
            'shop_types' => StoreType::get(),
            'intact_customers' => IntactCustomer::get(),
            'intact_payment_terms' => IntactPaymentTerm::all(),
            'intact_transaction_statuses' => IntactTransactionStatus::all(),
            'intact_departments' => IntactDepartment::all(),
            'intact_classes' => IntactClass::all(),
            'shopify_fields' => ShopifyOrderField::get(),
            'store_products' => $selected_user ? Product::where('user_id', $selected_user->id)->get() : [],
            'vendors' => Vendor::get(),
            'decorators' => Decorator::get(),
            'shippings' => ShopifyShippingField::get(),
            'locations' => ShopifyLocationField::get(),
            'product_types' => ProductType::get(),
            'shopify_vendors' => ShopifyVendor::get(),
        ];

        return sendResponse(true, "All data retrieved successfully!", $object, $editing_account);
    }

    public function SaveInConnectAccount(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'defaultSettings.selectedUser.value' => 'required',
            'defaultSettings.selectedShopType.value' => 'required',
            'defaultSettings.selectedStatus.value' => 'required',
            'defaultSettings.selectedIntactClass.value' => 'required',
            'defaultSettings.selectedIntactDepartment.value' => 'required',
            'defaultSettings.selectedIntactPaymentTerms.value' => 'required',
            'defaultSettings.selectedIntactTransactionStatus.value' => 'required',
            'defaultSettings.fieldsMapping.*.selected_field.value' => 'required',
            'defaultSettings.fieldsMapping.*.intact_item' => 'required',
            'decoratorSync' => new DecoratorRules,
        ], [
            'defaultSettings.selectedUser.value' => 'User is required',
            'defaultSettings.selectedShopType.value' => 'Shop Type is required',
            'defaultSettings.selectedStatus.value' => 'Status is required',
            'defaultSettings.selectedIntactClass.value' => 'Default Class is required',
            'defaultSettings.selectedIntactDepartment.value' => 'Default Department is required',
            'defaultSettings.selectedIntactPaymentTerms.value' => 'Default Payment Terms is required',
            'defaultSettings.selectedIntactTransactionStatus.value' => 'Default Transaction Status is required',
            'defaultSettings.fieldsMapping.*.selected_field.value' => 'Shopify Field is required',
            'defaultSettings.fieldsMapping.*.intact_item' => 'Intact Field is required',
        ]);

        if ($validator->fails())
            return simpleValidate($validator);

        // return $request->all();

        DB::beginTransaction();
        try {

            $inconnect_account = InconnectAccount::firstOrNew(['user_id' => $request->defaultSettings['selectedUser']['value']]);

            $inconnect_account->user_id = $request->defaultSettings['selectedUser']['value'];
            $inconnect_account->store_type_id = $request->defaultSettings['selectedShopType']['value'];
            $inconnect_account->status = $request->defaultSettings['selectedStatus']['value'];
            $inconnect_account->intact_customer_id = $request->defaultSettings['selectedIntactCustomer']['value'];
            $inconnect_account->tax_exempt_number = $request->defaultSettings['taxExemptNumber'];

            $inconnect_account->intact_class_id = $request->defaultSettings['selectedIntactClass']['value'];
            $inconnect_account->intact_department_id = $request->defaultSettings['selectedIntactDepartment']['value'];
            $inconnect_account->intact_payment_term_id = $request->defaultSettings['selectedIntactPaymentTerms']['value'];
            $inconnect_account->intact_transaction_status_id = $request->defaultSettings['selectedIntactTransactionStatus']['value'];
            // $inconnect_account->shipping_method = $request->vendorSync['shippingMethod'];

            $inconnect_account->save();

            InconnectStatus::where('inconnect_account_id', $inconnect_account->id)->delete();
            $inconnect_statuses = new InconnectStatus();
            $inconnect_statuses->inconnect_account_id = $inconnect_account->id;
            $inconnect_statuses->order_status_open = $request->defaultSettings['order_status_open'];
            $inconnect_statuses->order_status_closed = $request->defaultSettings['order_status_closed'];
            $inconnect_statuses->order_status_cancelled = $request->defaultSettings['order_status_cancelled'];
            $inconnect_statuses->fulfillment_status_unshipped = $request->defaultSettings['fulfillment_status_unshipped'];
            $inconnect_statuses->fulfillment_status_shipped = $request->defaultSettings['fulfillment_status_shipped'];
            $inconnect_statuses->fulfillment_status_partial = $request->defaultSettings['fulfillment_status_partial'];
            $inconnect_statuses->fulfillment_status_fulfilled = $request->defaultSettings['fulfillment_status_fulfilled'];
            $inconnect_statuses->fulfillment_status_unfulfilled = $request->defaultSettings['fulfillment_status_unfulfilled'];
            $inconnect_statuses->financial_status_voided = $request->defaultSettings['financial_status_voided'];
            $inconnect_statuses->financial_status_pending = $request->defaultSettings['financial_status_pending'];
            $inconnect_statuses->financial_status_authorized = $request->defaultSettings['financial_status_authorized'];
            $inconnect_statuses->financial_status_partially_paid = $request->defaultSettings['financial_status_partially_paid'];
            $inconnect_statuses->financial_status_paid = $request->defaultSettings['financial_status_paid'];
            $inconnect_statuses->financial_status_partially_refunded = $request->defaultSettings['financial_status_partially_refunded'];
            $inconnect_statuses->financial_status_refunded = $request->defaultSettings['financial_status_refunded'];
            $inconnect_statuses->financial_status_unpaid = $request->defaultSettings['financial_status_unpaid'];
            $inconnect_statuses->save();

            InconnectFraudStatus::where('inconnect_account_id', $inconnect_account->id)->delete();
            $inconnect_statuses = new InconnectFraudStatus();
            $inconnect_statuses->inconnect_account_id = $inconnect_account->id;
            $inconnect_statuses->low = $request->defaultSettings['fraud_status_low'];
            $inconnect_statuses->medium = $request->defaultSettings['fraud_status_medium'];
            $inconnect_statuses->high = $request->defaultSettings['fraud_status_high'];
            $inconnect_statuses->save();

            InconnectIntactField::where('inconnect_account_id', $inconnect_account->id)->delete();
            foreach ($request->defaultSettings['fieldsMapping'] as $key => $value) {

                $inconnect_intact_field = new InconnectIntactField();
                $inconnect_intact_field->inconnect_account_id = $inconnect_account->id;
                $inconnect_intact_field->intact_field_name = $value['intact_item'];
                $inconnect_intact_field->shopify_order_field_id = $value['selected_field']['value'];
                $inconnect_intact_field->save();
            }

            InconnectIgnoredVendors::where('inconnect_account_id', $inconnect_account->id)->delete();
            foreach ($request->vendorSync['ignoredVendors'] as $key => $value) {
                $inconnect_vendors = new InconnectIgnoredVendors();
                $inconnect_vendors->inconnect_account_id = $inconnect_account->id;
                $inconnect_vendors->vendor_id = $value['value'];
                $inconnect_vendors->save();
            }

            InconnectDirectVendor::where('inconnect_account_id', $inconnect_account->id)->delete();
            foreach ($request->vendorSync['directVendors'] as $key => $value) {
                $inconnect_vendors = new InconnectDirectVendor();
                $inconnect_vendors->inconnect_account_id = $inconnect_account->id;
                $inconnect_vendors->vendor_id = $value['value'];
                $inconnect_vendors->save();
            }

            InconnectIgnoredProduct::where('inconnect_account_id', $inconnect_account->id)->delete();
            foreach ($request->vendorSync['ignoredProducts'] as $key => $value) {
                $inconnect_ignored_products = new InconnectIgnoredProduct();
                $inconnect_ignored_products->inconnect_account_id = $inconnect_account->id;
                $inconnect_ignored_products->product_id = $value['value'];
                $inconnect_ignored_products->save();
            }
            InconnectIgnoredProductType::where('inconnect_account_id', $inconnect_account->id)->delete();
            foreach ($request->vendorSync['ignoredProductTypes'] as $key => $value) {
                $inconnect_ignored_products = new InconnectIgnoredProductType();
                $inconnect_ignored_products->inconnect_account_id = $inconnect_account->id;
                $inconnect_ignored_products->product_type_id = $value['value'];
                $inconnect_ignored_products->save();
            }

            $inconnect_decorators = InconnectDecorator::where('inconnect_account_id', $inconnect_account->id)->get();
            foreach ($inconnect_decorators as $key => $value) {
                InconnectShipping::where('inconnect_decorator_id', $value->id)->delete();
                InconnectDecoratorNoDataProductType::where('inconnect_decorator_id', $value->id)->delete();
                $value->delete();
            }

            foreach ($request->decoratorSync as $key => $value) {
                if ($value['temp_sync'] == true) {

                    $decorator = new InconnectDecorator();
                    $decorator->inconnect_account_id = $inconnect_account->id;
                    $decorator->decorator_id = $value['id'];
                    $decorator->sync = $value['temp_sync'];
                    $decorator->due_date_days = $value['temp_due_date_days'];
                    $decorator->no_data_product_type_status = $value['no_data_product_type_status'];
                    $decorator->location_to_logo = $value['temp_location_to_logo']['value'];
                    $decorator->vip_customers = $value['temp_vip_customers'];
                    $decorator->poly_bag = $value['temp_poly_bag'];
                    $decorator->save();

                    foreach ($value['shippingMapping'] as $key2 => $value2) {
                        $shipping = new InconnectShipping();
                        $shipping->inconnect_decorator_id = $decorator->id;
                        $shipping->shopify_shipping_field_id = $value2['selected_shipping']['value'];
                        $shipping->{"3p_account_number"} = $value2['three_p_account_number'];
                        $shipping->carrier_id = $value2['carrier_id'];
                        $shipping->method_id = $value2['method_id'];
                        $shipping->save();
                    }

                    foreach ($value['no_data_product_types'] as $key2 => $value2) {
                        $stock_vendor = new InconnectDecoratorNoDataProductType();
                        $stock_vendor->inconnect_decorator_id = $decorator->id;
                        $stock_vendor->product_type_id = $value2['value'];
                        $stock_vendor->save();
                    }
                }
            }

            DB::commit();
            return sendResponse(true, "Account created successfully!");
            //
        } catch (Exception $e) {
            DB::rollBack();
            return $e->getMessage();
        }
    }

    public function index(Request $request)
    {
        $products = InconnectAccount::with(['shop.applications', 'store_type', 'decorators', 'direct_vendors', 'ignored_vendors'])
            ->when($request->get('q'), function ($q) use ($request) {
                $q->whereHas('shop', function ($q) use ($request) {
                    $q->where(function ($q) use ($request) {
                        $q->orWhere('name', 'LIKE', '%' . $request->q . '%');
                        $q->orWhere('store_name', 'LIKE', '%' . $request->q . '%');
                    });
                });
            })->when($request->get('q4'), function ($q) use ($request) {
                $q->whereHas('shop', function ($q) use ($request) {
                    $q->where(function ($q) use ($request) {
                        $q->orWhere('name', 'LIKE', '%' . $request->q4 . '%');
                        $q->orWhere('store_name', 'LIKE', '%' . $request->q4 . '%');
                    });
                });
            })->when($request->get('q5'), function ($q) use ($request) {
                $q->when($request->get('q5') == "id asc", function ($q) {
                    $q->orderBy("id", "asc");
                });
                $q->when($request->get('q5') == "id desc", function ($q) {
                    $q->orderBy("id", "desc");
                });
            })->when($request->get('q6'), function ($q) use ($request) {
                $q->when(json_decode($request->get('q6'))[0] == true, function ($q) {
                    $q->where("status", true);
                });
                $q->when(json_decode($request->get('q6'))[0] == false, function ($q) {
                    $q->where("status", false);
                });
            })->when($request->get('q7'), function ($q) use ($request) {
                $q->when(json_decode($request->get('q7'))[0] == "PopShop", function ($q) {
                    $q->where("store_type_id", 1);
                });
                $q->when(json_decode($request->get('q7'))[0] == "BrandShop", function ($q) {
                    $q->where("store_type_id", 2);
                });
            })->when($request->get('q8'), function ($q) use ($request) {
                $q->whereHasIn('decorators', function ($q) use ($request) {
                    $q->whereIn('decorators.id', json_decode($request->q8));
                });
            })->cursorPaginate($request->page_count);

        $decorators = Decorator::get();

        return responseJson(true, 'Variants retrieved successfully!', $products, $decorators);
    }

    public function changeStatuses(Request $request)
    {
        // return $request;

        $inconnect_account = InconnectAccount::find($request->inconnect_account_id);

        if ($request->type == "intact_sync") {
            $inconnect_account->intact_sync = $request->value == "true" ? true : false;
        }
        if ($request->type == "decorator_sync") {
            $inconnect_account->decorator_sync = $request->value == "true" ? true : false;
        }

        if ($request->type == "vendor_sync") {
            $inconnect_account->vendor_sync = $request->value == "true" ? true : false;
        }

        $inconnect_account->save();

        return sendResponse(true, "Status changed successfully!");
    }

    public function getUsers()
    {
        $users_with_inconnects = User::where('role_id', 2)->whereHas('inconnect_account')->get();
        $users = User::where('role_id', 2)->get();
        return sendResponse(true, "Users retrieved successfully!", $users, $users_with_inconnects);
    }

    public function duplicateInconnect(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'from.value' => 'required',
            'to.value' => 'required',
        ]);

        if ($validator->fails())
            return simpleValidate($validator);

        $source_user_id = $request->from['value'];
        $target_user_id = $request->to['value'];

        if ($source_user_id == $target_user_id)
            return sendResponse(false, "You can't duplicate account to same user!");

        $copying_account = InconnectAccount::with(['shop', 'store_type', 'decorators.pivot.shippings.shipping_origin', 'direct_vendors', 'ignored_vendors', 'statuses', 'fraud_statuses', 'mapping.mapping_forward', 'ignored_products.product_origin', 'intact_customer'])->where('user_id', $source_user_id)->first();
        // return $copying_account;

        DB::beginTransaction();
        try {

            $inconnect_account = InconnectAccount::firstOrNew(['user_id' => $target_user_id]);

            $inconnect_account->user_id = $target_user_id;
            $inconnect_account->store_type_id = $copying_account->store_type_id;
            $inconnect_account->status = $copying_account->status;
            $inconnect_account->intact_customer_id = $copying_account->intact_customer_id;
            $inconnect_account->tax_exempt_number = $copying_account->tax_exempt_number;

            $inconnect_account->intact_class_id = $copying_account->intact_class_id;
            $inconnect_account->intact_department_id = $copying_account->intact_department_id;
            $inconnect_account->intact_payment_term_id = $copying_account->intact_payment_term_id;
            $inconnect_account->intact_transaction_status_id = $copying_account->intact_transaction_status_id;
            $inconnect_account->save();

            InconnectStatus::where('inconnect_account_id', $inconnect_account->id)->delete();
            $inconnect_statuses = new InconnectStatus();
            $inconnect_statuses->inconnect_account_id = $inconnect_account->id;
            $inconnect_statuses->order_status_open = $copying_account->statuses->order_status_open;
            $inconnect_statuses->order_status_closed = $copying_account->statuses->order_status_closed;
            $inconnect_statuses->order_status_cancelled = $copying_account->statuses->order_status_cancelled;
            $inconnect_statuses->fulfillment_status_unshipped = $copying_account->statuses->fulfillment_status_unshipped;
            $inconnect_statuses->fulfillment_status_shipped = $copying_account->statuses->fulfillment_status_shipped;
            $inconnect_statuses->fulfillment_status_partial = $copying_account->statuses->fulfillment_status_partial;
            $inconnect_statuses->fulfillment_status_fulfilled = $copying_account->statuses->fulfillment_status_fulfilled;
            $inconnect_statuses->fulfillment_status_unfulfilled = $copying_account->statuses->fulfillment_status_unfulfilled;
            $inconnect_statuses->financial_status_voided = $copying_account->statuses->financial_status_voided;
            $inconnect_statuses->financial_status_pending = $copying_account->statuses->financial_status_pending;
            $inconnect_statuses->financial_status_authorized = $copying_account->statuses->financial_status_authorized;
            $inconnect_statuses->financial_status_partially_paid = $copying_account->statuses->financial_status_partially_paid;
            $inconnect_statuses->financial_status_paid = $copying_account->statuses->financial_status_paid;
            $inconnect_statuses->financial_status_partially_refunded = $copying_account->statuses->financial_status_partially_refunded;
            $inconnect_statuses->financial_status_refunded = $copying_account->statuses->financial_status_refunded;
            $inconnect_statuses->financial_status_unpaid = $copying_account->statuses->financial_status_unpaid;
            $inconnect_statuses->save();

            InconnectFraudStatus::where('inconnect_account_id', $inconnect_account->id)->delete();
            $inconnect_statuses = new InconnectFraudStatus();
            $inconnect_statuses->inconnect_account_id = $inconnect_account->id;
            $inconnect_statuses->low = $copying_account->fraud_statuses->low;
            $inconnect_statuses->medium = $copying_account->fraud_statuses->medium;
            $inconnect_statuses->high = $copying_account->fraud_statuses->high;
            $inconnect_statuses->save();

            InconnectIntactField::where('inconnect_account_id', $inconnect_account->id)->delete();
            foreach ($copying_account->mapping as $key => $map) {

                $inconnect_intact_field = new InconnectIntactField();
                $inconnect_intact_field->inconnect_account_id = $inconnect_account->id;
                $inconnect_intact_field->intact_field_name = $map->intact_field_name;
                $inconnect_intact_field->shopify_order_field_id = $map->shopify_order_field_id;
                $inconnect_intact_field->save();
            }

            InconnectIgnoredVendors::where('inconnect_account_id', $inconnect_account->id)->delete();
            foreach ($copying_account->ignored_vendors as $key => $vendor) {

                $inconnect_vendors = new InconnectIgnoredVendors();
                $inconnect_vendors->inconnect_account_id = $inconnect_account->id;
                $inconnect_vendors->vendor_id = $vendor->id;
                $inconnect_vendors->save();
            }

            InconnectDirectVendor::where('inconnect_account_id', $inconnect_account->id)->delete();
            foreach ($copying_account->direct_vendors as $key => $vendor) {
                $inconnect_vendors = new InconnectDirectVendor();
                $inconnect_vendors->inconnect_account_id = $inconnect_account->id;
                $inconnect_vendors->vendor_id = $vendor->id;
                $inconnect_vendors->save();
            }

            $inconnect_decorators = InconnectDecorator::where('inconnect_account_id', $inconnect_account->id)->get();
            foreach ($inconnect_decorators as $key => $value) {
                InconnectShipping::where('inconnect_decorator_id', $value->id)->delete();
                InconnectDecoratorNoDataProductType::where('inconnect_decorator_id', $value->id)->delete();
                $value->delete();
            }

            foreach ($copying_account->decorators as $key => $decorator) {

                $new_decorator = new InconnectDecorator();
                $new_decorator->inconnect_account_id = $inconnect_account->id;
                $new_decorator->decorator_id = $decorator->pivot->decorator_id;
                $new_decorator->sync = $decorator->pivot->sync;
                $new_decorator->due_date_days = $decorator->pivot->due_date_days;
                $new_decorator->location_to_logo = $decorator->pivot->location_to_logo;
                $new_decorator->no_data_product_type_status = $decorator->pivot->no_data_product_type_status;
                $new_decorator->vip_customers = $decorator->pivot->vip_customers;
                $new_decorator->poly_bag = $decorator->pivot->poly_bag;
                $new_decorator->save();

                foreach ($decorator->pivot->shippings as $key2 => $shipping) {

                    $shipping_new = new InconnectShipping();
                    $shipping_new->inconnect_decorator_id = $new_decorator->id;
                    $shipping_new->shopify_shipping_field_id = $shipping->shopify_shipping_field_id;
                    $shipping_new->{"3p_account_number"} = $shipping->{"3p_account_number"};
                    $shipping_new->carrier_id = $shipping->carrier_id;
                    $shipping_new->method_id = $shipping->method_id;
                    $shipping_new->save();
                }

                foreach ($decorator->pivot->no_data_product_types as $key2 => $no_data_type) {

                    $stock_vendor = new InconnectDecoratorNoDataProductType();
                    $stock_vendor->inconnect_decorator_id = $new_decorator->id;
                    $stock_vendor->shopify_vendor_id = $no_data_type->shopify_vendor_id;
                    $stock_vendor->save();
                }
            }

            DB::commit();
            return sendResponse(true, "Account Duplicated successfully!");
            //
        } catch (Exception $e) {
            DB::rollBack();
            return $e->getMessage();
        }
    }
}
