<?php

namespace Database\Factories;

use App\Models\Testimonial;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Testimonial> */
class TestimonialFactory extends Factory
{
    public function definition(): array
    {
        return [
            'client_name' => fake()->name(),
            'client_role' => fake()->jobTitle(),
            'client_photo' => null,
            'content' => fake()->paragraph(),
            'rating' => fake()->numberBetween(4, 5),
            'is_featured' => true,
        ];
    }
}
