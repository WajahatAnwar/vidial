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
        Schema::create('p_o_shipping_rules', function (Blueprint $table) {
            $table->id();
            $table->string("name");
            $table->unsignedBigInteger("p_o_rule_type_id");
            $table->string("first_value");
            $table->decimal("shipping_price", 8, 2)->nullable();
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
        Schema::dropIfExists('p_o_shipping_rules');
    }
};
