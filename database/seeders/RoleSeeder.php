<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::connection('all_in_one_conn')->table('roles')->insert([
            ['id' => 1,'title' => "Admin",'type' => "admin"],
            ['id' => 2,'title' => "Shop",'type' => "shop"],
        ]);
    }
}
