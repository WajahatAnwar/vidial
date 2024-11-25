<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StoreTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::connection('in_connect_conn')->table('store_types')->insert([
            ['id' => 1, 'name' => "PopShop"],
            ['id' => 2, 'name' => "BrandShop"]
        ]);
    }
}
