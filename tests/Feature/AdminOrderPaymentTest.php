<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AdminOrderPaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_cancel_pending_payment(): void
    {
        config(['services.borderpay.base_url' => 'https://borderpay.test/api/v1']);
        $admin = User::factory()->create(['role' => 'admin']);
        $order = Order::factory()->create(['total_snapshot' => 150000]);
        Payment::query()->create(['order_id' => $order->id, 'provider' => 'borderpay', 'reference_id' => $order->order_number, 'status' => 'pending', 'amount' => 150000, 'fee' => 0, 'customer_pays' => 150000, 'merchant_receives' => 150000]);
        Http::fake(['https://borderpay.test/api/v1/payments/*/cancel' => Http::response(['status' => 'expired'])]);

        $this->actingAs($admin)
            ->post(route('admin.orders.cancel-payment', $order))
            ->assertSessionHas('payment_cancelled');
        $this->assertDatabaseHas('payments', ['order_id' => $order->id, 'status' => 'expired']);
    }

    public function test_non_admin_cannot_cancel_payment(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $order = Order::factory()->create(['total_snapshot' => 150000]);
        Payment::query()->create(['order_id' => $order->id, 'provider' => 'borderpay', 'reference_id' => $order->order_number, 'status' => 'pending', 'amount' => 150000, 'fee' => 0, 'customer_pays' => 150000, 'merchant_receives' => 150000]);

        $this->actingAs($user)
            ->post(route('admin.orders.cancel-payment', $order))
            ->assertForbidden();
        Http::assertNothingSent();
    }

    public function test_admin_can_sync_payment_status(): void
    {
        config(['services.borderpay.base_url' => 'https://borderpay.test/api/v1']);
        $admin = User::factory()->create(['role' => 'admin']);
        $order = Order::factory()->create(['status' => 'pending_confirmation', 'total_snapshot' => 150000]);
        Payment::query()->create(['order_id' => $order->id, 'provider' => 'borderpay', 'reference_id' => $order->order_number, 'status' => 'pending', 'amount' => 150000, 'fee' => 0, 'customer_pays' => 150000, 'merchant_receives' => 150000]);
        Http::fake(['https://borderpay.test/api/v1/payments/*' => Http::response(['status' => 'paid', 'amount' => 150000])]);

        $this->actingAs($admin)
            ->post(route('admin.orders.sync-payment', $order))
            ->assertSessionHas('payment_synced');
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'paid']);
    }

    public function test_admin_can_simulate_pending_payment_in_test_mode(): void
    {
        config(['services.borderpay.base_url' => 'https://borderpay.test/api/v1', 'services.borderpay.api_key' => 'bp_test_example']);
        $admin = User::factory()->create(['role' => 'admin']);
        $order = Order::factory()->create(['total_snapshot' => 150000]);
        Payment::query()->create(['order_id' => $order->id, 'provider' => 'borderpay', 'reference_id' => $order->order_number, 'status' => 'pending', 'amount' => 150000, 'fee' => 0, 'customer_pays' => 150000, 'merchant_receives' => 150000]);
        Http::fake(['https://borderpay.test/api/v1/payments/*/simulate' => Http::response(['status' => 'paid'])]);

        $this->actingAs($admin)
            ->post(route('admin.orders.simulate-payment', $order))
            ->assertSessionHas('payment_simulated');
        $this->assertDatabaseHas('payments', ['order_id' => $order->id, 'status' => 'paid']);
    }

    public function test_admin_cannot_cancel_paid_payment(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $order = Order::factory()->create(['total_snapshot' => 150000]);
        Payment::query()->create(['order_id' => $order->id, 'provider' => 'borderpay', 'reference_id' => $order->order_number, 'status' => 'paid', 'amount' => 150000, 'fee' => 0, 'customer_pays' => 150000, 'merchant_receives' => 150000]);

        $this->actingAs($admin)
            ->post(route('admin.orders.cancel-payment', $order))
            ->assertSessionHasErrors(['payment' => 'Pembayaran tidak dapat dibatalkan.']);
        Http::assertNothingSent();
    }

    public function test_admin_cannot_mark_order_paid_without_verified_payment(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $order = Order::factory()->create(['status' => 'pending_confirmation']);

        $this->actingAs($admin)
            ->put(route('admin.orders.update', $order), ['status' => 'paid'])
            ->assertStatus(422);
    }
}

// @phpstan-ignore-next-line
