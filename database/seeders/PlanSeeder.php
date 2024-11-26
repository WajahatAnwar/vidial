<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = \Faker\Factory::create();
        DB::table("plans")->insert([
            "type" => 'Month',
            "name" => 'Standard',
            "price" => 49.99,
            'description' =>"For small brands who wants to collect fews videos UGC for their Ads, Reviews & Social Networks.",
            'ugc_video_count' =>10,
            'ugc_email_count' => 2000,
        ]);
        DB::table("plans")->insert([
            "type" => 'Month',
            "name" => 'Premium',
            "price" => 99.99,
            'description' =>"For medium brands who wants to collect fews videos UGC for their Ads, Reviews & Social Networks.",
            'ugc_video_count' =>50,
            'ugc_email_count' => 10000,
        ]);
        DB::table("plans")->insert([
            "type" => 'Month',
            "name" => 'Advanced',
            "price" => 299.99,
            'description' => "For bigs brands and Shopify Plus who wants to collect fews videos UGC for their Ads, Reviews & Social Networks.",
            'ugc_video_count' =>200,
            'ugc_email_count' =>50000,
        ]);

    }
}
