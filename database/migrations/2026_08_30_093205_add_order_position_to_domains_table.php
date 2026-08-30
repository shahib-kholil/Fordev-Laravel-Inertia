<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('domains', function (Blueprint $table) {
            $table->unsignedInteger('order_position')->default(0)->after('id')->index();
        });

        DB::table('domains')->orderBy('id')->get(['id'])->each(fn ($domain, $index) => DB::table('domains')->where('id', $domain->id)->update(['order_position' => $index + 1]));
    }

    public function down(): void
    {
        Schema::table('domains', function (Blueprint $table) {
            $table->dropColumn('order_position');
        });
    }
};
