<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('domain_coupons', function (Blueprint $table) {
            $table->string('bundle_id')->nullable()->after('domain_id')->index();
            $table->foreignId('domain_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('domain_coupons', function (Blueprint $table) {
            $table->dropIndex(['bundle_id']);
            $table->dropColumn('bundle_id');
            $table->foreignId('domain_id')->nullable(false)->change();
        });
    }
};
