<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('domains', function (Blueprint $table) {
            $table->unsignedInteger('renewal_price')->nullable()->after('promo_price');
            $table->unsignedInteger('transfer_price')->nullable()->after('renewal_price');
        });
    }

    public function down(): void
    {
        Schema::table('domains', function (Blueprint $table) {
            $table->dropColumn(['renewal_price', 'transfer_price']);
        });
    }
};
