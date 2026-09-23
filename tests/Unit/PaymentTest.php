<?php

namespace Tests\Unit;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_payment_belongs_to_order_and_preserves_money_as_integers(): void
    {
        $order = Order::factory()->create();
        $payment = Payment::query()->create([
            'order_id' => $order->id,
            'provider' => 'borderpay',
            'reference_id' => $order->order_number,
            'method' => 'qris',
            'amount' => 150000,
            'fee' => 1000,
            'customer_pays' => 150000,
            'merchant_receives' => 149000,
        ]);

        $this->assertTrue($payment->order->is($order));
        $this->assertSame(150000, $payment->amount);
        $this->assertDatabaseHas('payments', [
            'provider' => 'borderpay',
            'reference_id' => $order->order_number,
        ]);
    }
}
