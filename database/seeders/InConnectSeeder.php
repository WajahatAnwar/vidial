<?php

namespace Database\Seeders;

use App\Models\InConnect\IntactPaymentTerm;
use App\Models\InConnect\IntactTransactionStatus;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InConnectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            ShopifyOrderFieldsSeeder::class,
            StoreTypeSeeder::class,
            InconnectOrderStatusSeeder::class,
        ]);

        // Your code to insert data into the table
        IntactPaymentTerm::create([
            'id' => 1,
            'payment_term_id' => '1',
            'name' => 'Net 30',
            // 'created_at' and 'updated_at' columns will be automatically set by Laravel
        ]);

        IntactTransactionStatus::create([
            'id' => 1,
            'transaction_status_id' => '1',
            'name' => 'Pending',
            // 'created_at' and 'updated_at' columns will be automatically set by Laravel
        ]);
    }
}
