<?php

namespace Tests\Unit;

use App\Models\Order;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PaymentServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_gateway_checkout_snapshots_provider_response(): void
    {
        config([
            'services.borderpay.base_url' => 'https://borderpay.test/api/v1',
            'services.borderpay.api_key' => 'bp_test_example',
            'services.borderpay.return_url' => 'https://fordev.test/cek-status-pesanan',
        ]);
        Http::fake([
            'https://borderpay.test/api/v1/payments' => Http::response([
                'type' => 'session',
                'id' => 'pay_1',
                'status' => 'pending',
                'amount' => 150000,
                'fee' => 0,
                'customer_pays' => 150000,
                'merchant_receives' => 150000,
                'checkout_url' => 'https://borderpay.test/checkout/1',
            ], 201),
        ]);
        $order = Order::factory()->create(['total_snapshot' => 150000]);

        $payment = app(PaymentService::class)->createGatewayCheckout($order);

        $this->assertSame('pay_1', $payment->provider_payment_id);
        $this->assertSame('https://borderpay.test/checkout/1', $payment->checkout_url);
        $this->assertDatabaseHas('payments', [
            'order_id' => $order->id,
            'reference_id' => $order->order_number,
        ]);
    }

    public function test_existing_reference_is_not_sent_to_provider_again(): void
    {
        $order = Order::factory()->create(['total_snapshot' => 150000]);
        $existing = Payment::query()->create([
            'order_id' => $order->id,
            'provider' => 'borderpay',
            'reference_id' => $order->order_number,
            'method' => null,
            'status' => 'pending',
            'amount' => 150000,
            'fee' => 0,
            'customer_pays' => 150000,
            'merchant_receives' => 150000,
        ]);

        $payment = app(PaymentService::class)->createGatewayCheckout($order);

        $this->assertTrue($payment->is($existing));
        Http::assertNothingSent();
    }

    public function test_cancel_pending_marks_payment_expired(): void
    {
        config(['services.borderpay.base_url' => 'https://borderpay.test/api/v1']);
        $order = Order::factory()->create(['total_snapshot' => 150000]);
        $payment = Payment::query()->create(['order_id' => $order->id, 'provider' => 'borderpay', 'reference_id' => $order->order_number, 'status' => 'pending', 'amount' => 150000, 'fee' => 0, 'customer_pays' => 150000, 'merchant_receives' => 150000]);
        Http::fake(['https://borderpay.test/api/v1/payments/*/cancel' => Http::response(['status' => 'expired'])]);

        $result = app(PaymentService::class)->cancelPending($payment);

        $this->assertSame('expired', $result->status);
    }

    public function test_cancel_paid_payment_is_rejected_without_gateway_request(): void
    {
        $order = Order::factory()->create(['total_snapshot' => 150000]);
        $payment = Payment::query()->create(['order_id' => $order->id, 'provider' => 'borderpay', 'reference_id' => $order->order_number, 'status' => 'paid', 'amount' => 150000, 'fee' => 0, 'customer_pays' => 150000, 'merchant_receives' => 150000]);

        $this->expectException(\RuntimeException::class);
        app(PaymentService::class)->cancelPending($payment);
        Http::assertNothingSent();
    }

    public function test_simulate_pending_marks_payment_and_order_paid(): void
    {
        config(['services.borderpay.base_url' => 'https://borderpay.test/api/v1', 'services.borderpay.api_key' => 'bp_test_example']);
        $order = Order::factory()->create(['status' => 'pending_confirmation', 'total_snapshot' => 150000]);
        $payment = Payment::query()->create(['order_id' => $order->id, 'provider' => 'borderpay', 'reference_id' => $order->order_number, 'status' => 'pending', 'amount' => 150000, 'fee' => 0, 'customer_pays' => 150000, 'merchant_receives' => 150000]);
        Http::fake(['https://borderpay.test/api/v1/payments/*/simulate' => Http::response(['status' => 'paid'])]);

        $result = app(PaymentService::class)->simulatePending($payment);

        $this->assertSame('paid', $result->status);
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'paid']);
    }

    public function test_simulate_is_rejected_in_live_mode(): void
    {
        config(['services.borderpay.api_key' => 'bp_live_example']);
        $order = Order::factory()->create(['total_snapshot' => 150000]);
        $payment = Payment::query()->create(['order_id' => $order->id, 'provider' => 'borderpay', 'reference_id' => $order->order_number, 'status' => 'pending', 'amount' => 150000, 'fee' => 0, 'customer_pays' => 150000, 'merchant_receives' => 150000]);

        $this->expectException(\RuntimeException::class);
        app(PaymentService::class)->simulatePending($payment);
        Http::assertNothingSent();
    }

    public function test_sync_status_marks_payment_and_order_paid(): void
    {
        config([
            'services.borderpay.base_url' => 'https://borderpay.test/api/v1',
            'services.borderpay.api_key' => 'bp_test_example',
        ]);
        $order = Order::factory()->create(['status' => 'pending_confirmation', 'total_snapshot' => 150000]);
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
        Http::fake(['https://borderpay.test/api/v1/payments/*' => Http::response(['status' => 'paid', 'amount' => 150000])]);

        $result = app(PaymentService::class)->syncStatus($payment);

        $this->assertSame('paid', $result->status);
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'paid']);
    }

    public function test_sync_status_rejects_amount_mismatch(): void
    {
        config(['services.borderpay.base_url' => 'https://borderpay.test/api/v1']);
        $order = Order::factory()->create(['total_snapshot' => 150000]);
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
        Http::fake(['https://borderpay.test/api/v1/payments/*' => Http::response(['status' => 'paid', 'amount' => 1])]);

        $this->expectException(\RuntimeException::class);
        app(PaymentService::class)->syncStatus($payment);
    }

    public function test_non_https_return_url_is_rejected_before_gateway_request(): void
    {
        config(['services.borderpay.return_url' => 'http://localhost:8000/cek-status-pesanan']);
        $order = Order::factory()->create(['total_snapshot' => 150000]);

        $this->expectException(\RuntimeException::class);
        app(PaymentService::class)->createGatewayCheckout($order);
        Http::assertNothingSent();
    }
}
