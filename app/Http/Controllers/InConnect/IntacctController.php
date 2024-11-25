<?php

namespace App\Http\Controllers\InConnect;

use App\Http\Controllers\Controller;
use App\Jobs\InConnect\IntacctOrderCreateJob;
use App\Jobs\InConnect\IntacctProductCreateJob;
use App\Models\InConnect\IntactClass;
use App\Models\InConnect\IntactCustomer;
use App\Models\InConnect\IntactDepartment;
use App\Models\InConnect\IntactLocation;
use App\Models\InConnect\IntactVendor;
use App\Traits\InConnect\IntacctTrait;
use Http;
use Illuminate\Http\Request;

class IntacctController extends Controller
{
    use IntacctTrait;
    public function getIntacctVendors()
    {
        $vendors = $this->getVendors();
        foreach ($vendors as $vendor) {
            $intacctVendor = IntactVendor::updateOrCreate([
                'vendor_id' => $vendor['VENDORID'],
            ], [
                'name' => $vendor['NAME']
            ]);
        }

        return sendResponse(true, "Vendors fetched successfully");
    }

    public function createIntacctItem(Request $request)
    {
        $payload = [
            'vendor_name' => 'Boston Properties',
            'title' => 'Test Item 6',
            'item_id' => '6020096',
            'price' => 26.52,
            'shipping_weight' => 10.21,
            'brand' => '',
            'subbrand' => '',
            'category' => '',
            'subcategory' => '',
            'size1' => '',
            'style' => '',
            'color' => '',
        ];
        IntacctProductCreateJob::dispatch($payload);
    }

    public function createIntacctOrder(Request $request)
    {
        $payload = [
            'due_date' => '2023-11-31',
            'vendor_id' => 20001,
            'reference_no' => '123456',
            'line_items' => [
                [
                    'item_id' => '6020096',
                    'quantity' => 1,
                    'location_id' => 120,
                    'department_id' => 300
                ]
            ]
        ];
        IntacctOrderCreateJob::dispatch($payload);
    }

    public function getIntacctLocations()
    {
        $locations = $this->getLocations();
        foreach ($locations as $location) {
            $intacctLocation = IntactLocation::updateOrCreate([
                'location_id' => $location['LOCATIONID'],
            ], [
                'name' => $location['NAME']
            ]);
        }
    }

    public function getIntacctDepartments()
    {
        $departments = $this->getDepartments();
        foreach ($departments as $department) {
            $intacctDepartment = IntactDepartment::updateOrCreate([
                'department_id' => $department['DEPARTMENTID'],
            ], [
                'name' => $department['TITLE']
            ]);
        }
    }

    public function getIntacctCustomers()
    {
        $customers = $this->getCustomers();
        foreach($customers as $customer) {
            $intacctCustomer = IntactCustomer::updateOrCreate([
                'customer_id' => $customer['CUSTOMERID'],
            ], [
                'name' => $customer['NAME'],
                'email' => $customer['BILLTO.EMAIL1'] != [] ? $customer['BILLTO.EMAIL1'] : ($customer['DISPLAYCONTACT.EMAIL1'] != [] ? $customer['DISPLAYCONTACT.EMAIL1'] : NULL )
            ]);
        }
    }

    public function getIntacctClasses()
    {
        $classes = $this->getClasses();
        foreach($classes as $class) {
            $intacctClass = IntactClass::updateOrCreate([
                'class_id' => $class['CLASSID'],
            ], [
                'name' => $class['NAME']
            ]);
        }
    }

}
