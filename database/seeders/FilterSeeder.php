<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FilterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // DB::connection('filter_conn')->table('filter_data')->insert([
        //     ['id' => 1, 'type' => 'product_tag', 'name' => "Tag 1"],
        //     ['id' => 2, 'type' => 'product_tag', 'name' => "Tag 2"],
        //     ['id' => 3, 'type' => 'product_type', 'name' => "Type 1"],
        //     ['id' => 4, 'type' => 'product_type', 'name' => "Type 2"],
        //     ['id' => 5, 'type' => 'product_size', 'name' => "Size 1"],
        //     ['id' => 6, 'type' => 'product_size', 'name' => "Size 2"],
        // ]);

        DB::connection('filter_conn')->table('default_states')->insert([
            ['id' => 1, 'name' => 'Expanded'],
            ['id' => 2, 'name' => 'Collapsed']
        ]);

        DB::connection('filter_conn')->table('filter_types')->insert([
            ['id' => 1, 'name' => 'Tag'],
            ['id' => 2, 'name' => 'Product Type'],
            ['id' => 3, 'name' => 'Color Families'],
            ['id' => 4, 'name' => 'Size'],
            ['id' => 5, 'name' => 'Price']
        ]);

        DB::connection('filter_conn')->table('sort_types')->insert([
            ['id' => 1, 'name' => 'Alphabetical'],
            ['id' => 2, 'name' => 'Product Count'],
            ['id' => 3, 'name' => 'Manual']
        ]);
    }
}
