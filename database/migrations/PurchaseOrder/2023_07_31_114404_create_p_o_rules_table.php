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
        Schema::connection('purchase_order_conn')->create('p_o_rules', function (Blueprint $table) {
            $table->id();
            $table->string('rule_name')->nullable();
            $table->string('rule_type')->nullable();
            $table->json('rule_tags')->nullable();
            $table->boolean('tags_dependency')->default(false);
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
        Schema::connection('purchase_order_conn')->dropIfExists('p_o_rules');
    }
};
