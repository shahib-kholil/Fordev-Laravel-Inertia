<?php

namespace Database\Factories;

use App\Models\WebService;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<WebService> */
class WebServiceFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->paragraph(),
            'price' => fake()->numberBetween(1500000, 12000000),
            'features' => fake()->randomElements(['Desain responsif', 'SEO dasar', 'CMS admin', 'Integrasi WhatsApp', 'Optimasi performa'], 3),
            'image' => null,
            'is_active' => true,
        ];
    }
}
