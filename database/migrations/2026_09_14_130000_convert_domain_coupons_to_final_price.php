<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('domain_coupons')->update(['type' => 'fixed']);
    }

    public function down(): void
    {
        DB::table('domain_coupons')->update(['type' => 'percent']);
    }
};
