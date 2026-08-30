<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (! Schema::hasColumn('orders', 'liquid_customer_id')) {
                $table->string('liquid_customer_id')->nullable()->after('domain_price_snapshot');
                $table->string('liquid_domain_id')->nullable()->after('liquid_customer_id');
                $table->text('liquid_error')->nullable()->after('liquid_domain_id');
                $table->timestamp('paid_at')->nullable()->after('liquid_error');
                $table->timestamp('registered_at')->nullable()->after('paid_at');
            }
        });

        DB::table('orders')->where('status', 'pending')->update(['status' => 'pending_confirmation']);
        DB::table('orders')->where('status', 'processing')->update(['status' => 'pending_payment']);
        DB::table('orders')->where('status', 'completed')->update(['status' => 'active']);
    }

    public function down(): void
    {
        DB::table('orders')->where('status', 'pending_confirmation')->update(['status' => 'pending']);
        DB::table('orders')->where('status', 'pending_payment')->update(['status' => 'processing']);
        DB::table('orders')->where('status', 'active')->update(['status' => 'completed']);

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['liquid_customer_id', 'liquid_domain_id', 'liquid_error', 'paid_at', 'registered_at']);
        });
    }
};
