<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PORuleTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::connection('purchase_order_conn')->table('p_o_rule_types')->insert([
            ['id' => 1, 'name' => "Specific shipping for given location"],
            ['id' => 2, 'name' => "Specific shipping for products having given tag"],
            ['id' => 3, 'name' => "Everything is free except Standard shipping for given location"],
            ['id' => 4, 'name' => "No shipping to given state/country"],
        ]);
    }
}
