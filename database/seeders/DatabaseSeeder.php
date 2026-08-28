<?php

namespace Database\Seeders;

use App\Models\Domain;
use App\Models\Order;
use App\Models\Portfolio;
use App\Models\Setting;
use App\Models\Testimonial;
use App\Models\User;
use App\Models\WebService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@fordev.test',
        ]);

        Setting::query()->upsert([
            ['key' => 'contact_email', 'value' => 'hello@fordev.test'],
            ['key' => 'contact_whatsapp', 'value' => '6281234567890'],
            ['key' => 'contact_address', 'value' => 'Bandung, Indonesia'],
            ['key' => 'social_instagram', 'value' => 'https://instagram.com/fordev'],
        ], ['key'], ['value']);

        WebService::query()->upsert([
            [
                'name' => 'Paket Basic',
                'slug' => 'paket-basic',
                'description' => 'Website sederhana untuk profil bisnis dan landing page.',
                'price' => 2500000,
                'features' => json_encode(['Desain responsif', '3 halaman utama', 'Form kontak', 'SEO dasar']),
                'image' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Paket Premium',
                'slug' => 'paket-premium',
                'description' => 'Website bisnis lengkap dengan admin panel dan fitur custom.',
                'price' => 7500000,
                'features' => json_encode(['Admin panel', 'Halaman dinamis', 'Integrasi WhatsApp', 'Optimasi performa']),
                'image' => null,
                'is_active' => true,
            ],
        ], ['slug'], ['name', 'description', 'price', 'features', 'image', 'is_active']);

        Domain::query()->upsert([
            ['extension' => '.com', 'price' => 185000, 'is_available' => true],
            ['extension' => '.id', 'price' => 250000, 'is_available' => true],
            ['extension' => '.co.id', 'price' => 300000, 'is_available' => true],
            ['extension' => '.web.id', 'price' => 75000, 'is_available' => true],
        ], ['extension'], ['price', 'is_available']);

        Portfolio::factory()->count(4)->create();
        Testimonial::factory()->count(4)->create();
        Order::factory()->count(3)->create();
    }
}
