<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Jobs\RegisterPaidOrder;
use App\Models\Payment;
use App\Models\User;
use App\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

// Regression coverage for payment state handling.
class AuditPaymentStateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Http::preventStrayRequests();
        Bus::fake();
        config(['services.borderpay.api_key' => 'bp_test_audit', 'services.borderpay.webhook_token' => 'audit-only']);
    }

    public function test_paid_webhook_does_not_demote_active_order(): void
    {
        $order = Order::factory()->create(['status' => 'active', 'total_snapshot' => 100000]);
        Payment::create(['order_id' => $order->id, 'provider' => 'borderpay', 'reference_id' => $order->order_number, 'amount' => 100000, 'customer_pays' => 100000, 'merchant_receives' => 100000, 'fee' => 0, 'status' => 'paid']);
        $this->postJson('/webhooks/borderpay', [
            'event' => 'payment.paid', 'mode' => 'test',
            'data' => ['reference_id' => $order->order_number, 'mode' => 'test', 'amount' => 100000, 'customer_pays' => 100000, 'merchant_receives' => 100000, 'fee' => 0, 'status' => 'paid'],
        ], ['x-borderpay-token' => 'audit-only', 'x-borderpay-mode' => 'test'])->assertOk();
        $this->assertSame('active', $order->fresh()->status);
    }

    public function test_paid_webhook_registers_domain_automatically(): void
    {
        $order = Order::factory()->create(['status' => 'pending_confirmation', 'total_snapshot' => 100000]);
        Payment::create(['order_id' => $order->id, 'provider' => 'borderpay', 'reference_id' => $order->order_number, 'amount' => 100000, 'customer_pays' => 100000, 'merchant_receives' => 100000, 'fee' => 0, 'status' => 'pending']);

        $this->postJson('/webhooks/borderpay', [
            'event' => 'payment.paid', 'mode' => 'test',
            'data' => ['reference_id' => $order->order_number, 'mode' => 'test', 'amount' => 100000, 'status' => 'paid'],
        ], ['x-borderpay-token' => 'audit-only', 'x-borderpay-mode' => 'test'])->assertOk();
        Bus::assertDispatched(RegisterPaidOrder::class, fn ($job) => $job->orderId === $order->id);
    }

    public function test_verified_manual_payment_cannot_be_registered(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);
        $order = Order::factory()->create(['status' => 'paid', 'total_snapshot' => 100000]);
        Payment::create(['order_id' => $order->id, 'provider' => 'manual', 'reference_id' => $order->order_number, 'amount' => 100000, 'customer_pays' => 100000, 'merchant_receives' => 100000, 'fee' => 0, 'status' => 'paid']);
        $this->actingAs($admin)->putJson('/admin/orders/'.$order->id, ['status' => 'paid', 'action' => 'approve_register'])->assertRedirect();
        Http::assertNothingSent();
    }

    public function test_reselecting_manual_reuses_expired_payment(): void
    {
        $order = Order::factory()->create(['status' => 'pending_confirmation', 'total_snapshot' => 100000]);
        $service = app(PaymentService::class);
        $payment = $service->createManualPayment($order);
        $payment->update(['status' => 'expired']);
        $again = $service->createManualPayment($order);
        $this->assertSame($payment->id, $again->id);
        $this->assertSame('pending', $again->status);
        Http::assertNothingSent();
    }
}
