<?php

namespace Database\Factories;

use App\Models\Portfolio;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Portfolio> */
class PortfolioFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->unique()->company().' Website';

        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'description' => fake()->paragraph(),
            'image' => 'portfolios/placeholder.jpg',
            'project_url' => fake()->url(),
            'category' => fake()->randomElement(['Company Profile', 'E-Commerce', 'Landing Page']),
            'is_featured' => fake()->boolean(60),
            'order_position' => fake()->numberBetween(0, 20),
        ];
    }
}
