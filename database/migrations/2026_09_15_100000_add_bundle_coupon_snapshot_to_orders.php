<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('bundle_id')->nullable()->after('domain_name');
            $table->unsignedInteger('bundle_price_snapshot')->nullable()->after('domain_price_snapshot');
            $table->unsignedInteger('bundle_discount_snapshot')->default(0)->after('bundle_price_snapshot');
            $table->string('bundle_coupon_code_snapshot')->nullable()->after('bundle_discount_snapshot');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['bundle_id', 'bundle_price_snapshot', 'bundle_discount_snapshot', 'bundle_coupon_code_snapshot']);
        });
    }
};
