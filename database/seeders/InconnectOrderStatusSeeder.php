<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InconnectOrderStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::connection('in_connect_conn')->table('inconnect_order_statuses')->insert([
            ['name' => 'Received'],
            ['name' => 'Sent to vendor'],
            ['name' => 'Sent to intacct for vendor'],
            ['name' => 'Sent to decorator'],
            ['name' => 'Sent to intacct for decorator'],
            ['name' => 'Received on decorator'],
            ['name' => 'Shipped from decorator'],
            ['name' => 'Fulfilled']
        ]);
    }
}
