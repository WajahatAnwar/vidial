<?php

namespace App\Http\Controllers\InConnect;

use App\Http\Controllers\Controller;
use App\Jobs\InConnect\IntacctVendorInvoiceJob;
use App\Models\InConnect\IntactDepartment;
use App\Models\InConnect\IntactLocation;
use App\Models\InConnect\Vendor;
use App\Models\InConnect\ShopifyVendor;
use App\Models\InConnect\IntactVendor;
use App\Models\InConnect\VendorPurchaseOrder;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Requests\InConnect\VendorRequest;
use App\Jobs\InConnect\VendorInvoiceJob;
use App\Models\InConnect\Batch;

class VendorController extends Controller
{

    public function index()
    {
        return Inertia::render('Applications/InConnect/Connections/Vendors/Vendors', [
            'shopifyVendors' => ShopifyVendor::all(),
            'intactVendors' => IntactVendor::all(),
            'intactLocations' => IntactLocation::all(),
            'intactDepartments' => IntactDepartment::all(),
        ]);
    }

    public function vendorsList(Request $request)
    {
        $vendors = Vendor::when($request->get('q'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->orWhere('name', 'LIKE', '%' . $request->q . '%');
                $q->orWhere('po_prefix', 'LIKE', '%' . $request->q . '%');
                $q->orWhere('intact_vendor_id', 'LIKE', '%' . $request->q . '%');
            });
        })->with(['intactVendor', 'intactLocation', 'intactDepartment', 'address', 'shopifyVendors'])->paginate($request->page_count);
        return responseJson(true, 'Vendors retrieved successfully!', $vendors);
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
    public function store(VendorRequest $request)
    {
        $vendor = Vendor::create([
            'name' => $request->name,
            'intact_vendor_id' => $request->intact_vendor['value'],
            'intact_location_id' => $request->intact_location['value'],
            'intact_department_id' => $request->intact_department['value'],
            'shipping_method' => $request->shipping_method,
            'po_prefix' => $request->po_prefix,
            'username' => $request->username,
            'password' => $request->password,
            'product_data_endpoint' => $request->product_data_endpoint,
            'purchase_order_endpoint' => $request->purchase_order_endpoint,
            'pricing_and_configuration_endpoint' => $request->pricing_and_configuration_endpoint,
            'invoice_endpoint' => $request->invoice_endpoint,
            'shipment_endpoint' => $request->shipment_endpoint,
        ]);

        $vendor->address()->create($request->address);

        foreach ($request->shopify_vendors as $shopify_vendor) {
            $vendor->shopifyVendors()->attach($shopify_vendor['value']);
        }

        return responseJson(true, 'Vendor created successfully!', null);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\InConnect\Vendor  $vendor
     * @return \Illuminate\Http\Response
     */
    public function show(Vendor $vendor)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\InConnect\Vendor  $vendor
     * @return \Illuminate\Http\Response
     */
    public function edit(Vendor $vendor)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\InConnect\Vendor  $vendor
     * @return \Illuminate\Http\Response
     */
    public function update(VendorRequest $request, Vendor $vendor)
    {
        $vendor->update([
            'name' => $request->name,
            'intact_vendor_id' => $request->intact_vendor['value'],
            'intact_location_id' => $request->intact_location['value'],
            'intact_department_id' => $request->intact_department['value'],
            'shipping_method' => $request->shipping_method,
            'po_prefix' => $request->po_prefix,
            'username' => $request->username,
            'password' => $request->password,
            'product_data_endpoint' => $request->product_data_endpoint,
            'purchase_order_endpoint' => $request->purchase_order_endpoint,
            'pricing_and_configuration_endpoint' => $request->pricing_and_configuration_endpoint,
            'invoice_endpoint' => $request->invoice_endpoint,
            'shipment_endpoint' => $request->shipment_endpoint,
        ]);

        $vendor->address()->update($request->address);

        $vendor->shopifyVendors()->detach();
        foreach ($request->shopify_vendors as $shopify_vendor) {
            $vendor->shopifyVendors()->attach($shopify_vendor['value']);
        }

        return responseJson(true, 'Vendor updated successfully!', null);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\InConnect\Vendor  $vendor
     * @return \Illuminate\Http\Response
     */
    public function destroy(Vendor $vendor)
    {
        //
    }

    public function generateInvoices()
    {
        // ->orderBy('id','desc')->take(2)->get()
        // VendorPurchaseOrder::where('purchase_order_no','like','%L&S%')->whereNotNull('intact_payload')->whereNotNull('invoice_number')->whereNotNull('intact_po_number')->whereNull('intact_invoice_number')->orderBy('id','desc')->get()->each(function ($purchaseOrder) {
        // VendorPurchaseOrder::whereNotNull('intact_payload')->whereNotNull('invoice_number')->whereNotNull('intact_po_number')->whereNull('intact_invoice_number')->get()->each(function ($purchaseOrder) {
        VendorPurchaseOrder::whereNull('invoice_number')->whereNotNull('intact_payload')->get()->each(function ($purchaseOrder) {
            VendorInvoiceJob::dispatch($purchaseOrder);
        });

        Batch::whereNull('invoice_number')->whereNotNull('intacct_payload')->get()->each(function ($batch) {
            VendorInvoiceJob::dispatch(null, $batch);
        });

        // return VendorPurchaseOrder::whereNotNull('invoice_number')->whereNull('intact_invoice_number')->whereNotNull('intact_payload')->get()->each(function ($purchaseOrder) {
        //  // VendorInvoiceJob::dispatch($purchaseOrder);
        // });


        // return $orders = VendorPurchaseOrder::whereNotNull('invoice_number')->whereNull('intact_invoice_number')->whereNotNull('intact_payload')->get()->each(function (&$purchaseOrder) {
            // logger(json_encode($purchaseOrder->intact_payload));
            // 2024-04-17
            // $payload = $purchaseOrder->intact_payload;
            // $payload['due_date'] = "2024-08-07";
            // $purchaseOrder->intact_payload = $payload;
            // $purchaseOrder->update();
            // VendorInvoiceJob::dispatch($purchaseOrder);
        // });
    }
}
