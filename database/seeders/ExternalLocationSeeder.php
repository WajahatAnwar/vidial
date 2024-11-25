<?php

namespace Database\Seeders;

use App\Models\AllInOne\ExternalLocation;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ExternalLocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        ExternalLocation::create([
            'location_id' => 247178,
            'location_name' => 'Default Location',
            'location_rank' => 1,
        ]);
    }
}
