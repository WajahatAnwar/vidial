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
        Schema::table('users', function (Blueprint $table) {
            $table->bigInteger('old_user_id')->nullable()->after('access_token');
            $table->bigInteger('access_level_id')->nullable();
            $table->bigInteger('account_id')->nullable();
            $table->bigInteger('status_id')->nullable();
            $table->string('lastname')->nullable();
            $table->string('username')->nullable();
            $table->string('quick_login_code')->nullable();
            $table->string('hash')->nullable();
            $table->datetime('last_login')->nullable();
            $table->string('last_known_ip')->nullable();
            $table->string('auto_login_token')->nullable();
            $table->string('password_recovery_token')->nullable();
            // $table->string('uuid')->nullable();
            $table->string('hashid')->nullable();
            $table->string('phone')->nullable();
            $table->bigInteger('hr_parent_id')->nullable();
            $table->bigInteger('hr_parent_index')->nullable();
            $table->bigInteger('hr_department_id')->nullable();
            $table->bigInteger('hr_area_id')->nullable();
            $table->string('hr_status')->nullable();
            $table->boolean('hr_all_access')->nullable();
            $table->boolean('is_terminated')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            //
        });
    }
};
