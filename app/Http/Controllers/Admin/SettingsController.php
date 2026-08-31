<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public static function defaultPackageCards(): array
    {
        return [
            ['label' => 'Penawaran spesial', 'title' => 'Promo', 'description' => 'Lihat promo terbaru.', 'details' => 'Dapatkan penawaran terbaik untuk mulai online dengan biaya lebih hemat.', 'href' => '/jasa-web'],
            ['label' => 'Siap dikembangkan', 'title' => 'Jasa Website', 'description' => 'Website profesional.', 'details' => 'Website cepat, responsif, mudah dikelola, dan siap dikembangkan sesuai kebutuhan.', 'href' => '/jasa-web'],
            ['label' => 'Nama untuk bisnismu', 'title' => 'Domain', 'description' => 'Cari domain untuk brand.', 'details' => 'Pilih ekstensi seperti .com, .id, .co.id, dan lainnya untuk brand atau bisnismu.', 'href' => '/domain'],
            ['label' => 'Paket lengkap', 'title' => 'Website + Gratis Domain', 'description' => 'Website sekaligus domain.', 'details' => 'Gratis domain .com, .id, atau ekstensi pilihan lainnya dalam satu paket website.', 'href' => '/jasa-web'],
        ];
    }

    public function edit(): Response
    {
        $settings = Setting::query()->pluck('value', 'key');

        return Inertia::render('admin/settings/edit', [
            'settings' => $settings,
            'packageCards' => json_decode($settings['home_package_cards'] ?? '[]', true) ?: self::defaultPackageCards(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_whatsapp' => ['nullable', 'string', 'max:30'],
            'contact_address' => ['nullable', 'string', 'max:500'],
            'social_instagram' => ['nullable', 'url', 'max:255'],
            'package_cards' => ['required', 'array', 'size:4'],
            'package_cards.*.label' => ['required', 'string', 'max:60'],
            'package_cards.*.title' => ['required', 'string', 'max:80'],
            'package_cards.*.description' => ['required', 'string', 'max:240'],
            'package_cards.*.details' => ['nullable', 'string', 'max:500'],
            'package_cards.*.href' => ['required', 'string', 'max:255', 'starts_with:/'],
        ]);

        $data['home_package_cards'] = json_encode($data['package_cards']);
        unset($data['package_cards']);

        foreach ($data as $key => $value) {
            Setting::query()->updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return back();
    }
}
