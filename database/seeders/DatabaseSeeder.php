<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            RoleSeeder::class,
            AdminSeeder::class,
            // OptionTypeSeeder::class,
            // SCSettingSeeder::class,
            // POStateSeeder::class,
            // ExternalLocationSeeder::class,
            // PORuleTypeSeeder::class,
            ApplicationsSeeder::class,
            InConnectSeeder::class,
            FilterSeeder::class
        ]);
    }
}
