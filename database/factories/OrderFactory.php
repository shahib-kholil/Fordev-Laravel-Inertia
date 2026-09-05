<?php

namespace Database\Factories;

use App\Models\Domain;
use App\Models\Order;
use App\Models\WebService;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Order> */
class OrderFactory extends Factory
{
    public function definition(): array
    {
        $webService = WebService::query()->inRandomOrder()->first();
        $domain = Domain::query()->inRandomOrder()->first();

        return [
            'order_number' => 'FRD-'.now()->format('Ymd').'-'.Str::upper(Str::random(4)),
            'client_name' => fake()->name(),
            'client_email' => fake()->safeEmail(),
            'client_phone' => '081234567890',
            'order_type' => 'both',
            'web_service_id' => $webService?->id,
            'web_service_price_snapshot' => $webService?->price,
            'domain_id' => $domain?->id,
            'domain_name' => fake()->domainWord(),
            'domain_price_snapshot' => $domain?->price,
            'status' => fake()->randomElement(['pending_confirmation', 'pending_payment', 'paid', 'active', 'cancelled']),
            'notes' => fake()->sentence(),
            'admin_notes' => null,
        ];
    }
}
