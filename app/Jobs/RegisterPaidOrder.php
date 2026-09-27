<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\LiquidDomainRegistrar;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldBeUnique;

class RegisterPaidOrder implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public readonly int $orderId) {}

    public function uniqueId(): string
    {
        return 'register-paid-order:'.$this->orderId;
    }

    public function middleware(): array
    {
        return [new WithoutOverlapping($this->uniqueId())];
    }

    public function handle(LiquidDomainRegistrar $registrar): void
    {
        $order = Order::query()->find($this->orderId);
        if (! $order || $order->status !== 'paid') {
            return;
        }

        $registrar->register($order);
    }
}

// ponytail: the order id is the idempotency boundary; the registrar skips already-active domain items.
