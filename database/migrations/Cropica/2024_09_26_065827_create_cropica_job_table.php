<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cropica_jobs', function (Blueprint $table) {
            $table->id(); // Auto-incremented id
            $table->uuid('uuid'); // UUID (varchar 255)
            $table->string('store_name', 255); // Store name (varchar 255)
            $table->integer('store_id'); // Store ID (integer)
            $table->enum('type', ['miscellaneous', 'allproducts']); // Type (enum)
            $table->enum('status', ['Complete','InProgress','InQueue','Failed', 'Cancelled']); // Status (enum)
            $table->integer('total_images'); // Total images (integer)
            $table->integer('processed_images'); // Processed images (integer)
            $table->string('products_list', 2048); // Products list (varchar 2048)
            $table->integer('total_products');
            $table->integer('processed_products');
            $table->timestamps(); // created_at and updated_at
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('cropping_jobs');
    }
};
