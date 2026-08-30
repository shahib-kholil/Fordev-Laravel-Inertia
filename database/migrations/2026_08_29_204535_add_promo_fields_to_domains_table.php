<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('domains', function (Blueprint $table) {
            $table->unsignedInteger('promo_price')->nullable()->after('price');
            $table->string('category')->default('Populer')->after('promo_price');
            $table->string('badge')->nullable()->after('category');
        });
    }

    public function down(): void
    {
        Schema::table('domains', function (Blueprint $table) {
            $table->dropColumn(['promo_price', 'category', 'badge']);
        });
    }
};
