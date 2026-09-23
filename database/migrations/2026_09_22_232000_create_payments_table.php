<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('provider', 32);
            $table->string('reference_id', 64);
            $table->string('provider_payment_id')->nullable();
            $table->string('method', 32);
            $table->string('status', 32)->default('pending')->index();
            $table->unsignedInteger('amount');
            $table->unsignedInteger('fee')->default(0);
            $table->unsignedInteger('customer_pays');
            $table->unsignedInteger('merchant_receives');
            $table->string('fee_borne_by', 16)->nullable();
            $table->text('checkout_url')->nullable();
            $table->text('qr_string')->nullable();
            $table->string('va_number')->nullable();
            $table->string('va_bank', 32)->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->json('provider_payload')->nullable();
            $table->timestamps();

            $table->unique(['provider', 'reference_id']);
            $table->index(['order_id', 'status']);
            $table->index('provider_payment_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

// ponytail: provider_payload is retained for webhook audit; searchable payment values remain typed columns.
