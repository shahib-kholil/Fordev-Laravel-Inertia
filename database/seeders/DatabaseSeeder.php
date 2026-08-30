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
            'name' => 'Super Admin',
            'email' => 'superadmin@fordev.test',
            'role' => 'super_admin',
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
            ['extension' => '.com', 'price' => 209900, 'promo_price' => 109900, 'renewal_price' => 209900, 'transfer_price' => 189900, 'category' => 'Populer', 'badge' => null, 'is_available' => true],
            ['extension' => '.id', 'price' => 252900, 'promo_price' => 210900, 'renewal_price' => 252900, 'transfer_price' => 252900, 'category' => 'Populer', 'badge' => null, 'is_available' => true],
            ['extension' => '.co.id', 'price' => 300000, 'promo_price' => null, 'renewal_price' => 300000, 'transfer_price' => 300000, 'category' => 'Bisnis', 'badge' => null, 'is_available' => true],
            ['extension' => '.web.id', 'price' => 75000, 'promo_price' => null, 'renewal_price' => 75000, 'transfer_price' => 75000, 'category' => 'Pendidikan', 'badge' => null, 'is_available' => true],
            ['extension' => '.online', 'price' => 626900, 'promo_price' => 17900, 'renewal_price' => 626900, 'transfer_price' => 626900, 'category' => 'Populer', 'badge' => 'Promo terbatas', 'is_available' => true],
            ['extension' => '.tech', 'price' => 1113900, 'promo_price' => 121900, 'renewal_price' => 1113900, 'transfer_price' => 1113900, 'category' => 'Teknologi', 'badge' => 'Promo terbatas', 'is_available' => true],
            ['extension' => '.org', 'price' => 312900, 'promo_price' => 156900, 'renewal_price' => 312900, 'transfer_price' => 312900, 'category' => 'Sosial', 'badge' => null, 'is_available' => true],
            ['extension' => '.net', 'price' => 312900, 'promo_price' => 188900, 'renewal_price' => 312900, 'transfer_price' => 312900, 'category' => 'Internasional', 'badge' => null, 'is_available' => true],
        ], ['extension'], ['price', 'promo_price', 'renewal_price', 'transfer_price', 'category', 'badge', 'is_available']);

        Portfolio::factory()->count(4)->create();
        Testimonial::factory()->count(4)->create();
        Order::factory()->count(3)->create();
    }
}
