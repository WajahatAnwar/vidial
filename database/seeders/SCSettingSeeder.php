<?php

namespace Database\Seeders;

use App\Models\SizeChart\SCSetting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SCSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        SCSetting::create([
            'button_text' => 'Size Chart',
        ]);
    }
}
