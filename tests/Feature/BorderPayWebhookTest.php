<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BorderPayWebhookTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.borderpay.webhook_token' => 'webhook-secret']);
        config(['services.borderpay.api_key' => 'bp_test_example']);
    }

    public function test_paid_webhook_marks_payment_and_order_paid(): void
    {
        $order = Order::factory()->create(['status' => 'pending_payment', 'total_snapshot' => 150000]);
        $payment = Payment::query()->create([
            'order_id' => $order->id,
            'provider' => 'borderpay',
            'reference_id' => $order->order_number,
            'status' => 'pending',
            'amount' => 150000,
            'fee' => 0,
            'customer_pays' => 150000,
            'merchant_receives' => 150000,
        ]);

        $response = $this->withHeaders(['x-borderpay-token' => 'webhook-secret', 'x-borderpay-mode' => 'test'])->postJson('/webhooks/borderpay', [
            'event' => 'payment.paid',
            'mode' => 'test',
            'data' => ['reference_id' => $payment->reference_id, 'mode' => 'test', 'status' => 'paid', 'amount' => 150000],
        ]);

        $response->assertOk()->assertJson(['ok' => true, 'payment_id' => $payment->id]);
        $this->assertDatabaseHas('payments', ['id' => $payment->id, 'status' => 'paid']);
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'paid']);
    }

    public function test_invalid_token_is_rejected(): void
    {
        $this->withHeader('x-borderpay-token', 'wrong')->postJson('/webhooks/borderpay', [])->assertUnauthorized();
    }

    public function test_duplicate_paid_webhook_is_idempotent(): void
    {
        $order = Order::factory()->create(['status' => 'pending_payment', 'total_snapshot' => 150000]);
        Payment::query()->create([
            'order_id' => $order->id,
            'provider' => 'borderpay',
            'reference_id' => $order->order_number,
            'status' => 'pending',
            'amount' => 150000,
            'fee' => 0,
            'customer_pays' => 150000,
            'merchant_receives' => 150000,
        ]);
        $payload = ['event' => 'payment.paid', 'data' => ['reference_id' => $order->order_number, 'status' => 'paid', 'amount' => 150000]];

        $payload['mode'] = 'test';
        $payload['data']['mode'] = 'test';
        $this->withHeaders(['x-borderpay-token' => 'webhook-secret', 'x-borderpay-mode' => 'test'])->postJson('/webhooks/borderpay', $payload)->assertOk();
        $this->withHeaders(['x-borderpay-token' => 'webhook-secret', 'x-borderpay-mode' => 'test'])->postJson('/webhooks/borderpay', $payload)->assertOk();

        $this->assertDatabaseCount('payments', 1);
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'paid']);
    }

    public function test_amount_mismatch_is_rejected_without_marking_paid(): void
    {
        $order = Order::factory()->create(['status' => 'pending_payment', 'total_snapshot' => 150000]);
        Payment::query()->create([
            'order_id' => $order->id,
            'provider' => 'borderpay',
            'reference_id' => $order->order_number,
            'status' => 'pending',
            'amount' => 150000,
            'fee' => 0,
            'customer_pays' => 150000,
            'merchant_receives' => 150000,
        ]);

        $this->withHeaders(['x-borderpay-token' => 'webhook-secret', 'x-borderpay-mode' => 'test'])
            ->postJson('/webhooks/borderpay', [
                'event' => 'payment.paid',
                'mode' => 'test',
                'data' => ['reference_id' => $order->order_number, 'mode' => 'test', 'status' => 'paid', 'amount' => 149000],
            ])
            ->assertUnprocessable();

        $this->assertDatabaseHas('payments', ['reference_id' => $order->order_number, 'status' => 'pending']);
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'pending_payment']);
    }

    public function test_paid_webhook_cannot_demote_paid_payment_or_active_order(): void
    {
        $order = Order::factory()->create(['status' => 'active', 'total_snapshot' => 150000]);
        Payment::query()->create([
            'order_id' => $order->id,
            'provider' => 'borderpay',
            'reference_id' => $order->order_number,
            'status' => 'paid',
            'amount' => 150000,
            'fee' => 0,
            'customer_pays' => 150000,
            'merchant_receives' => 150000,
        ]);

        $this->withHeaders(['x-borderpay-token' => 'webhook-secret', 'x-borderpay-mode' => 'test'])
            ->postJson('/webhooks/borderpay', [
                'event' => 'payment.expired',
                'mode' => 'test',
                'data' => ['reference_id' => $order->order_number, 'mode' => 'test', 'status' => 'expired', 'amount' => 150000],
            ])
            ->assertStatus(409);

        $this->assertDatabaseHas('payments', ['reference_id' => $order->order_number, 'status' => 'paid']);
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'active']);
    }
}

// @phpstan-ignore-next-line
