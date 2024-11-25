<?php

namespace App\Http\Controllers\InConnect;

use App\Http\Controllers\Controller;
use App\Models\InConnect\Decorator;
use App\Models\InConnect\DecoratorData;
use App\Models\InConnect\IntactDepartment;
use App\Models\InConnect\IntactLocation;
use App\Models\InConnect\IntactVendor;
use App\Models\InConnect\ShopifySize;
use Illuminate\Http\Request;
use App\Http\Requests\InConnect\DecoratorRequest;
use App\Models\InConnect\ShopifyVendor;
use App\Models\InConnect\stichList;
use Inertia\Inertia;

class DecoratorController extends Controller
{
    public function index()
    {
        return Inertia::render('Applications/InConnect/Connections/Decorators/Decorators');
    }

    public function decoratorsList(Request $request)
    {
        $decorators = Decorator::when($request->get('q'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->orWhere('name', 'LIKE', '%' . $request->q . '%');
                $q->orWhere('po_prefix', 'LIKE', '%' . $request->q . '%');
                $q->orWhere('intact_vendor_id', 'LIKE', '%' . $request->q . '%');
            });
        })->with(['intactVendor', 'intactLocation', 'intactDepartment', 'address', 'services.locations', 'sizes', 'stichList.stichingListDetails'])->paginate($request->page_count);

        return responseJson(true, 'Decorators retrieved successfully!', $decorators);
    }

    public function getOptions($type)
    {
        if ($type == 'size') {
            $options = ShopifySize::all();
        } else {
            // $options = DecoratorData::whereIn('type', explode(",", $type))->get();
            $options = DecoratorData::get();
        }

        return responseJson(true, 'Options retrieved successfully!', $options);
    }

    public function create()
    {
        return Inertia::render('Applications/InConnect/Connections/Decorators/Steps/Steps', [
            'intactVendors' => IntactVendor::all(),
            'intactLocations' => IntactLocation::all(),
            'intactDepartments' => IntactDepartment::all(),
            'shopifyVendors' => ShopifyVendor::all(),
        ]);
    }

    public function store(DecoratorRequest $request)
    {
        if ($request->step < 6) {
            return responseJson(true, '', null);
        }

        $decorator = Decorator::create([
            'name' => $request->name,
            'notes' => $request->notes,
            'intact_vendor_id' => $request->intact_vendor['value'],
            'intact_location_id' => $request->intact_location['value'],
            'intact_department_id' => $request->intact_department['value'],
            'po_prefix' => $request->po_prefix,
            'username' => $request->username,
            'password' => $request->password,
            'client_id' => $request->client_id,
            'client_secret' => $request->client_secret,
            'excluded_dates' => $request->excluded_dates ? implode(',', $request->excluded_dates) : null,
            'sat_sun_exclude' => $request->sat_sun_exclude,
            'vendor_stock_status' => $request->vendor_stock_status
        ]);

        $decorator->address()->create([
            'address_line_1' => $request->address['address_line_1'],
            'address_line_2' => $request->address['address_line_2'],
            'city' => $request->address['city'],
            'state' => $request->address['state'],
            'zip_code' => $request->address['zip_code'],
        ]);

        foreach ($request->sizes as $size) {
            $decoratorSize = $decorator->sizes()->create([
                'name' => $size['name'],
            ]);

            foreach ($size['shopify_sizes'] as $shopifySize) {
                $decoratorSize->decoratorShopifySizes()->create([
                    'shopify_size_id' => $shopifySize['value'],
                ]);
            }
        }

        foreach ($request->services as $service) {
            $decorator_data = DecoratorData::find($service['shopify_decoration']['value']);
            $dbService = $decorator->services()->create([
                'service_id' => $service['service_id'],
                'option_ids' => $service['option_ids'],
                'decorator_data_id' => $decorator_data->id,
            ]);

            foreach ($service['locations'] as $location) {
                $decorator_data = DecoratorData::find($location['shopify_location']['value']);
                $dbService->locations()->create([
                    'location_id' => $location['location_id'],
                    'decorator_data_id' => $decorator_data->id,
                ]);
            }
        }

        /****************** Start https://3.basecamp.com/5293232/buckets/34717198/card_tables/cards/7692044547 ********************/
        foreach ($request->stich_list as $stich_list) {
            $stitchCount = $decorator->stichList()->create([
                'title' => $stich_list['title'],
                'min' => $stich_list['min'],
                'max' => $stich_list['min'],
            ]);
            foreach ($stich_list['stitch_list_details'] as $stitch_count_detail) {
                $stitchCountDetail = $stitchCount->stichingListDetails()->create([
                    'from' => $stitch_count_detail['from'],
                    'to' => $stitch_count_detail['to'],
                    'price' => $stitch_count_detail['price'],
                ]);
            }
        }
        /****************** End https://3.basecamp.com/5293232/buckets/34717198/card_tables/cards/7692044547 ********************/


        foreach ($request->logo_phrases as $logoPhrase) {
            $decorator_data = DecoratorData::find($logoPhrase['value']);
            $decorator->logoPhrases()->create([
                'decorator_data_id' => $decorator_data->id,
            ]);
        }

        foreach ($request->second_logo_phrases as $logoPhrase) {
            $decorator_data = DecoratorData::find($logoPhrase['value']);
            $decorator->secondLogoPhrases()->create([
                'decorator_data_id' => $decorator_data->id,
            ]);
        }

        foreach ($request->logo_location_phrases as $logo_location_phrase) {
            $decorator_data = DecoratorData::find($logo_location_phrase['value']);
            $decorator->logoLocationPhrases()->create([
                'decorator_data_id' => $decorator_data->id,
            ]);
        }

        foreach ($request->second_logo_location_phrases as $logo_location_phrase) {
            $decorator_data = DecoratorData::find($logo_location_phrase['value']);
            $decorator->secondLogoLocationPhrases()->create([
                'decorator_data_id' => $decorator_data->id,
            ]);
        }

        foreach ($request->decorations as $decoration) {
            $decorator_data = DecoratorData::find($decoration['value']);
            $decorator->decorations()->create([
                'decorator_data_id' => $decorator_data->id,
            ]);
        }

        foreach ($request->custom_decorations as $decoration) {
            $decorator->customDecorations()->create([
                'name' => $decoration
            ]);
        }

        foreach ($request->personalization_inputs as $personalization_input) {
            $decorator_data = DecoratorData::find($personalization_input['value']);
            $decorator->personalizationInputs()->create([
                'decorator_data_id' => $decorator_data->id,
            ]);
        }

        foreach ($request->vendor_stocks as $vendor_stock) {
            $decorator->vendor_stocks()->create([
                'shopify_vendor_id' => $vendor_stock['value'],
            ]);
        }

        return responseJson(true, 'Decorator created successfully!', null);
    }

    public function show(Decorator $decorator)
    {
        //
    }

    public function edit(Decorator $decorator)
    {
        $decorator->excluded_dates = $decorator->excluded_dates ? explode(',', $decorator->excluded_dates) : [];

        return Inertia::render('Applications/InConnect/Connections/Decorators/Steps/Steps', [
            'decorator' => $decorator->load(['intactVendor', 'intactLocation', 'intactDepartment', 'address', 'services.locations', 'sizes', 'logoPhrases', 'secondLogoPhrases', 'decorations', 'customDecorations', 'logoLocationPhrases', 'secondLogoLocationPhrases', 'personalizationInputs', 'vendor_stocks.shopify_vendor','stichList.stichingListDetails']),
            'intactVendors' => IntactVendor::all(),
            'intactLocations' => IntactLocation::all(),
            'intactDepartments' => IntactDepartment::all(),
            'shopifyVendors' => ShopifyVendor::all(),
        ]);
    }

    public function update(DecoratorRequest $request, Decorator $decorator)
    {
        if ($request->step < 6) {
            return responseJson(true, '', null);
        }

        $decorator->update([
            'name' => $request->name,
            'notes' => $request->notes,
            'intact_vendor_id' => $request->intact_vendor['value'],
            'intact_location_id' => $request->intact_location['value'],
            'intact_department_id' => $request->intact_department['value'],
            'po_prefix' => $request->po_prefix,
            'username' => $request->username,
            'password' => $request->password,
            'client_id' => $request->client_id,
            'client_secret' => $request->client_secret,
            'excluded_dates' => $request->excluded_dates ? implode(',', $request->excluded_dates) : null,
            'sat_sun_exclude' => $request->sat_sun_exclude,
            'vendor_stock_status' => $request->vendor_stock_status
        ]);

        $decorator->address()->update([
            'address_line_1' => $request->address['address_line_1'],
            'address_line_2' => $request->address['address_line_2'],
            'city' => $request->address['city'],
            'state' => $request->address['state'],
            'zip_code' => $request->address['zip_code'],
        ]);

        foreach ($decorator->sizes as $size) {
            $size->decoratorShopifySizes()->delete();
            $size->delete();
        }

        foreach ($request->sizes as $size) {
            $decoratorSize = $decorator->sizes()->create([
                'name' => $size['name'],
            ]);
            foreach ($size['shopify_sizes'] as $shopifySize) {
                $decoratorSize->decoratorShopifySizes()->create([
                    'shopify_size_id' => $shopifySize['value'],
                ]);
            }
        }

        foreach ($decorator->services as $service) {
            $service->locations()->delete();
            $service->delete();
        }

        foreach ($request->services as $service) {
            $decorator_data = DecoratorData::find($service['shopify_decoration']['value']);
            $dbService = $decorator->services()->create([
                'service_id' => $service['service_id'],
                'option_ids' => $service['option_ids'],
                'decorator_data_id' => $decorator_data->id,
            ]);

            foreach ($service['locations'] as $location) {
                $decorator_data = DecoratorData::find($location['shopify_location']['value']);
                $dbService->locations()->create([
                    'location_id' => $location['location_id'],
                    'decorator_data_id' => $decorator_data->id,
                ]);
            }
        }

        
        /****************** Start https://3.basecamp.com/5293232/buckets/34717198/card_tables/cards/7692044547 ********************/
        foreach ($decorator->stichList as $stich_list) {
            $stich_list->stichingListDetails()->delete();
            $stich_list->delete();
        }
        foreach ($request->stich_list as $stich_list) {
            $stitchCount = $decorator->stichList()->create([
                'title' => $stich_list['title'],
                'min' => $stich_list['min'],
                'max' => $stich_list['min'],
            ]);
            foreach ($stich_list['stitch_list_details'] as $stitch_count_detail) {
                $stitchCountDetail = $stitchCount->stichingListDetails()->create([
                    'from' => $stitch_count_detail['from'],
                    'to' => $stitch_count_detail['to'],
                    'price' => $stitch_count_detail['price'],
                ]);
            }
        }
        /****************** End https://3.basecamp.com/5293232/buckets/34717198/card_tables/cards/7692044547 ********************/



        foreach ($request->logo_phrases as $logoPhrase) {
            $decorator_data = DecoratorData::find($logoPhrase['value']);
            $decorator->logoPhrases()->updateOrCreate([
                'decorator_data_id' => $decorator_data->id,
            ]);
        }

        foreach ($request->second_logo_phrases as $logoPhrase) {
            $decorator_data = DecoratorData::find($logoPhrase['value']);
            $decorator->secondLogoPhrases()->updateOrCreate([
                'decorator_data_id' => $decorator_data->id,
            ]);
        }

        $decorator->logoPhrases()->whereNotIn('decorator_data_id', array_column($request->logo_phrases, 'value'))->delete();
        $decorator->secondLogoPhrases()->whereNotIn('decorator_data_id', array_column($request->second_logo_phrases, 'value'))->delete();

        foreach ($request->logo_location_phrases as $logo_location_phrase) {
            $decorator_data = DecoratorData::find($logo_location_phrase['value']);
            $decorator->logoLocationPhrases()->updateOrCreate([
                'decorator_data_id' => $decorator_data->id,
            ]);
        }

        foreach ($request->second_logo_location_phrases as $logo_location_phrase) {
            $decorator_data = DecoratorData::find($logo_location_phrase['value']);
            $decorator->secondLogoLocationPhrases()->updateOrCreate([
                'decorator_data_id' => $decorator_data->id,
            ]);
        }

        $decorator->logoLocationPhrases()->whereNotIn('decorator_data_id', array_column($request->logo_location_phrases, 'value'))->delete();
        $decorator->secondLogoLocationPhrases()->whereNotIn('decorator_data_id', array_column($request->second_logo_location_phrases, 'value'))->delete();

        foreach ($request->decorations as $decoration) {
            $decorator_data = DecoratorData::find($decoration['value']);
            $decorator->decorations()->updateOrCreate([
                'decorator_data_id' => $decorator_data->id,
            ]);
        }

        $decorator->decorations()->whereNotIn('decorator_data_id', array_column($request->decorations, 'value'))->delete();

        foreach ($request->vendor_stocks as $vendor_stock) {
            $decorator->vendor_stocks()->updateOrCreate([
                'shopify_vendor_id' => $vendor_stock['value'],
            ]);
        }

        $decorator->vendor_stocks()->whereNotIn('shopify_vendor_id', array_column($request->vendor_stocks, 'value'))->delete();

        $decorator->customDecorations()->delete();
        foreach ($request->custom_decorations as $decoration) {
            $decorator->customDecorations()->create([
                'name' => $decoration
            ]);
        }

        foreach ($request->personalization_inputs as $personalization_input) {
            $decorator_data = DecoratorData::find($personalization_input['value']);
            $decorator->personalizationInputs()->updateOrCreate([
                'decorator_data_id' => $decorator_data->id,
            ]);
        }

        $decorator->personalizationInputs()->whereNotIn('decorator_data_id', array_column($request->personalization_inputs, 'value'))->delete();

        return responseJson(true, 'Decorator updated successfully!', null);
    }

    public function destroy(Decorator $decorator)
    {
        //
    }
}
