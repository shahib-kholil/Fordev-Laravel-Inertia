<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class OrderPaymentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.borderpay.return_url' => 'https://fordev.test/cek-status-pesanan']);
    }

    public function test_owner_is_redirected_to_borderpay_checkout(): void
    {
        config([
            'services.borderpay.base_url' => 'https://borderpay.test/api/v1',
            'services.borderpay.api_key' => 'bp_test_example',
        ]);
        Http::fake([
            'https://borderpay.test/api/v1/payments' => Http::response([
                'type' => 'session',
                'id' => 'pay_1',
                'status' => 'pending',
                'amount' => 150000,
                'customer_pays' => 150000,
                'merchant_receives' => 150000,
                'checkout_url' => 'https://borderpay.test/checkout/1',
            ], 201),
        ]);
        $user = User::factory()->create(['email' => 'owner@example.com']);
        $order = Order::factory()->create([
            'client_email' => $user->email,
            'status' => 'pending_confirmation',
            'total_snapshot' => 150000,
        ]);

        $this->actingAs($user)
            ->post(route('orders.payment', $order->order_number))
            ->assertRedirect('https://borderpay.test/checkout/1');

        $this->assertDatabaseHas('payments', ['order_id' => $order->id, 'status' => 'pending']);
    }

    public function test_user_cannot_start_payment_for_another_users_order(): void
    {
        $owner = User::factory()->create(['email' => 'owner@example.com']);
        $other = User::factory()->create(['email' => 'other@example.com']);
        $order = Order::factory()->create([
            'client_email' => $owner->email,
            'status' => 'pending_confirmation',
            'total_snapshot' => 150000,
        ]);

        $this->actingAs($other)
            ->post(route('orders.payment', $order->order_number))
            ->assertNotFound();

        $this->assertDatabaseCount('payments', 0);
    }

    public function test_gateway_connection_error_returns_safe_error(): void
    {
        config([
            'services.borderpay.base_url' => 'https://borderpay.test/api/v1',
            'services.borderpay.api_key' => 'bp_test_example',
        ]);
        Http::fake(['https://borderpay.test/api/v1/payments' => fn () => throw new ConnectionException('connection reset')]);
        $user = User::factory()->create(['email' => 'owner@example.com']);
        $order = Order::factory()->create(['client_email' => $user->email, 'status' => 'pending_confirmation', 'total_snapshot' => 150000]);

        $this->actingAs($user)
            ->from(route('orders.status', ['order' => $order->order_number]))
            ->post(route('orders.payment', $order->order_number))
            ->assertRedirect(route('orders.status', ['order' => $order->order_number]))
            ->assertSessionHasErrors(['payment' => 'Gateway pembayaran sedang tidak dapat dihubungi. Silakan coba lagi beberapa saat lagi.']);
    }

    public function test_owner_can_sync_payment_status(): void
    {
        config(['services.borderpay.base_url' => 'https://borderpay.test/api/v1']);
        $user = User::factory()->create(['email' => 'owner@example.com']);
        $order = Order::factory()->create(['client_email' => $user->email, 'status' => 'pending_confirmation', 'total_snapshot' => 150000]);
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
        Http::fake(['https://borderpay.test/api/v1/payments/*' => Http::response(['status' => 'paid', 'amount' => 150000])]);

        $this->actingAs($user)
            ->from(route('orders.status', ['order' => $order->order_number]))
            ->post(route('orders.payment.sync', $order->order_number))
            ->assertRedirect(route('orders.status', ['order' => $order->order_number]))
            ->assertSessionHas('payment_sync');
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'paid']);
    }

    public function test_user_cannot_sync_another_users_payment(): void
    {
        $owner = User::factory()->create(['email' => 'owner@example.com']);
        $other = User::factory()->create(['email' => 'other@example.com']);
        $order = Order::factory()->create(['client_email' => $owner->email, 'total_snapshot' => 150000]);
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

        $this->actingAs($other)
            ->post(route('orders.payment.sync', $order->order_number))
            ->assertNotFound();
    }

    public function test_sync_connection_error_returns_safe_error(): void
    {
        config(['services.borderpay.base_url' => 'https://borderpay.test/api/v1']);
        $user = User::factory()->create(['email' => 'owner@example.com']);
        $order = Order::factory()->create(['client_email' => $user->email, 'total_snapshot' => 150000]);
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
        Http::fake(['https://borderpay.test/api/v1/payments/*' => fn () => throw new ConnectionException('reset')]);

        $this->actingAs($user)
            ->from(route('orders.status', ['order' => $order->order_number]))
            ->post(route('orders.payment.sync', $order->order_number))
            ->assertSessionHasErrors(['payment' => 'Status pembayaran sedang tidak dapat diperbarui. Silakan coba lagi beberapa saat lagi.']);
    }

    public function test_existing_checkout_is_reused(): void
    {
        $user = User::factory()->create(['email' => 'owner@example.com']);
        $order = Order::factory()->create([
            'client_email' => $user->email,
            'status' => 'pending_confirmation',
            'total_snapshot' => 150000,
        ]);
        Payment::query()->create([
            'order_id' => $order->id,
            'provider' => 'borderpay',
            'reference_id' => $order->order_number,
            'status' => 'pending',
            'amount' => 150000,
            'fee' => 0,
            'customer_pays' => 150000,
            'merchant_receives' => 150000,
            'checkout_url' => 'https://borderpay.test/checkout/existing',
        ]);

        $this->actingAs($user)
            ->post(route('orders.payment', $order->order_number))
            ->assertRedirect('https://borderpay.test/checkout/existing');

        Http::assertNothingSent();
    }
}

// @phpstan-ignore-next-line
