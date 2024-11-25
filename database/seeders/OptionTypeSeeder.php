<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OptionTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::connection('virtual_options_conn')->table('option_types')->insert([
            ['id' => 1, 'name' => "Dropdown"],
            ['id' => 2, 'name' => "Logo Group"],
            ['id' => 3, 'name' => "Text Area"],
            ['id' => 4, 'name' => "File Upload"],
            ['id' => 5, 'name' => "Admin Note"],
            ['id' => 6, 'name' => "Input Fields"],
            ['id' => 7, 'name' => "Vendor Feed"],
            ['id' => 8, 'name' => "Size Grid"],
            ['id' => 9, 'name' => "Image Grid"]
        ]);
    }
}
