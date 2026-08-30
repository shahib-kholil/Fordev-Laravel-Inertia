<?php

namespace Database\Factories;

use App\Models\Domain;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Domain> */
class DomainFactory extends Factory
{
    public function definition(): array
    {
        return [
            'order_position' => fake()->numberBetween(1, 100),
            'extension' => '.'.fake()->unique()->lexify('???'),
            'price' => fake()->numberBetween(150000, 500000),
            'promo_price' => null,
            'renewal_price' => fake()->numberBetween(150000, 500000),
            'transfer_price' => fake()->numberBetween(150000, 500000),
            'category' => 'Populer',
            'badge' => null,
            'is_available' => true,
        ];
    }
}
