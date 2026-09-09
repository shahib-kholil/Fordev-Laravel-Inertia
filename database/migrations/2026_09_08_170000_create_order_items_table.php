Orders
FRD-20260908-VH1B
Super Admin · superadmin@fordev.test · +6287852950005

active
Status: active

Tipe: domain

Paket: -

Harga paket snapshot: -

Domain: kskskss .com

Harga domain snapshot: 264

Diskon snapshot: 209636

Privasi WHOIS: 0

Pajak: 29

Total snapshot: 293

Liquid Customer ID: 2

Liquid Domain ID: 100125

Paid at: 2026-09-08T17:44:14.000000Z

Registered at: 2026-09-08T17:44:27.000000Z

Liquid error: -

Catatan klien: -


active
Registrasi Liqu.id: pending. Domain menunggu proses/verifikasi provider.
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('domain_id')->nullable()->constrained()->nullOnDelete();
            $table->string('domain_name');
            $table->string('extension', 50);
            $table->unsignedInteger('price_snapshot');
            $table->unsignedInteger('discount_snapshot')->default(0);
            $table->unsignedInteger('tax_snapshot')->default(0);
            $table->string('status')->default('pending')->index();
            $table->string('liquid_domain_id')->nullable();
            $table->text('liquid_error')->nullable();
            $table->timestamp('registered_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
