<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->string('client_name');
            $table->string('client_email');
            $table->string('client_phone');
            $table->enum('order_type', ['website', 'domain', 'both']);
            $table->foreignId('web_service_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('web_service_price_snapshot')->nullable();
            $table->foreignId('domain_id')->nullable()->constrained()->nullOnDelete();
            $table->string('domain_name')->nullable();
            $table->unsignedInteger('domain_price_snapshot')->nullable();
            $table->string('status')->default('pending_confirmation')->index();
            $table->text('notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
