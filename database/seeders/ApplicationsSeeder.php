<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ApplicationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::connection('all_in_one_conn')->table('applications')->insert([
            ['id' => 1, 'name' => "Order Splitter", 'image_link' => env('APP_URL') . "/images/order_splitter.png", 'route' => env('APP_URL') . "/order_splitter/dashboard", 'created_at' => NULL, 'updated_at' => NULL],
            ['id' => 2, 'name' => "Analytics", 'image_link' => env('APP_URL') . "/images/analytics.png", 'route' => env('APP_URL') . "/analytics/dashboard", 'created_at' => NULL, 'updated_at' => NULL],
            ['id' => 3, 'name' => "Purchase Order", 'image_link' => env('APP_URL') . "/images/purchase_order.png", 'route' => env('APP_URL') . "/purchase_order/dashboard", 'created_at' => NULL, 'updated_at' => NULL],
            ['id' => 4, 'name' => "Virtual Options", 'image_link' => env('APP_URL') . "/images/virtual_options.png", 'route' => env('APP_URL') . "/virtual_options/dashboard", 'created_at' => NULL, 'updated_at' => NULL],
            ['id' => 5, 'name' => "Size Chart", 'image_link' => env('APP_URL') . "/images/size_chart.png", 'route' => env('APP_URL') . "/size_chart/dashboard", 'created_at' => NULL, 'updated_at' => NULL],
            ['id' => 6, 'name' => "Goosely", 'image_link' => env('APP_URL') . "/images/goosely.png", 'route' =>  env('APP_URL') . "/goosely/dashboard", 'created_at' => NULL, 'updated_at' => NULL],
            ['id' => 7, 'name' => "Filter", 'image_link' => env('APP_URL') . "/images/filter.png", 'route' =>    env('APP_URL') . "/filter/dashboard", 'created_at' => NULL, 'updated_at' => NULL],
            ['id' => 8, 'name' => "Racoon", 'image_link' => env('APP_URL') . "/images/racoon.png", 'route' =>    env('APP_URL') . "/racoon/dashboard", 'created_at' => NULL, 'updated_at' => NULL],
            ['id' => 9, 'name' => "Punchout", 'image_link' => env('APP_URL') . "/images/punchout.png", 'route' =>    env('APP_URL') . "/punchout/dashboard", 'created_at' => NULL, 'updated_at' => NULL],
            ['id' => 10, 'name' => "Cropica", 'image_link' => env('APP_URL') . "/images/cropica.png", 'route' =>    env('APP_URL') . "/cropica/fetch-products", 'created_at' => NULL, 'updated_at' => NULL],
        ]);
    }
}
