<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedInteger('domain_discount_snapshot')->nullable();
            $table->unsignedInteger('icann_fee_snapshot')->default(0);
            $table->unsignedInteger('whois_privacy_snapshot')->default(0);
            $table->unsignedInteger('tax_snapshot')->default(0);
            $table->unsignedInteger('total_snapshot')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['domain_discount_snapshot', 'icann_fee_snapshot', 'whois_privacy_snapshot', 'tax_snapshot', 'total_snapshot']);
        });
    }
};

// ponytail: checkout fees are fixed until payment integration exists; move them to settings when fees become admin-editable.

// @phpstan-ignore-next-line
