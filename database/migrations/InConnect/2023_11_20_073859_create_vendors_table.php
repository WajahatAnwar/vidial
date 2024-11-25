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
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->boolean('allow_processing')->default(TRUE);
            $table->string('po_prefix')->nullable();
            $table->string('so_prefix')->nullable();
            $table->unsignedBigInteger('intact_vendor_id')->nullable();
            $table->string('notes')->nullable();
            $table->string('username')->nullable();
            $table->string('password')->nullable();
            $table->string('product_data_endpoint')->nullable();
            $table->string('purchase_order_endpoint')->nullable();
            $table->string('pricing_and_configuration_endpoint')->nullable();
            $table->string('invoice_endpoint')->nullable();
            $table->string('intact_location_id')->nullable();
            $table->string('intact_department_id')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('vendors');
    }
};
