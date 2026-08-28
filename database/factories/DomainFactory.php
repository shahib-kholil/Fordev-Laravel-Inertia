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
            'extension' => '.'.fake()->unique()->lexify('???'),
            'price' => fake()->numberBetween(150000, 500000),
            'is_available' => true,
        ];
    }
}
