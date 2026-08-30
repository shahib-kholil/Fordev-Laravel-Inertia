<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Admin\SettingsController;
use App\Models\Domain;
use App\Models\Portfolio;
use App\Models\Setting;
use App\Models\Testimonial;
use App\Models\WebService;
use App\Services\DomainAvailabilityChecker;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicPageController extends Controller
{
    public function home(): Response
    {
        $packageCards = json_decode(Setting::query()->where('key', 'home_package_cards')->value('value') ?? '[]', true);

        return Inertia::render('public/home', [
            'packageCards' => $packageCards ?: SettingsController::defaultPackageCards(),
            'webServices' => WebService::query()->where('is_active', true)->take(3)->get(),
            'portfolios' => Portfolio::query()->where('is_featured', true)->orderBy('order_position')->take(4)->get(),
            'testimonials' => Testimonial::query()->where('is_featured', true)->take(4)->get(),
        ]);
    }

    public function webServices(): Response
    {
        return Inertia::render('public/web-services', [
            'webServices' => WebService::query()->where('is_active', true)->paginate(9),
        ]);
    }

    public function webService(WebService $webService): Response
    {
        abort_unless($webService->is_active, 404);

        return Inertia::render('public/web-service-detail', ['webService' => $webService]);
    }

    public function domains(Request $request, DomainAvailabilityChecker $checker): Response
    {
        $check = null;
        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:63', 'regex:/^[a-z0-9-]+$/'],
            'extension' => ['nullable', 'string', 'exists:domains,extension'],
        ]);

        if (filled($data['name'] ?? null) && filled($data['extension'] ?? null)) {
            $check = $checker->check($data['name'], $data['extension']);
        }

        return Inertia::render('public/domains', [
            'domains' => Domain::query()->where('is_available', true)->orderBy('order_position')->orderBy('id')->paginate(20),
            'filters' => $data,
            'check' => $check,
        ]);
    }

    public function portfolios(): Response
    {
        return Inertia::render('public/portfolios', [
            'portfolios' => Portfolio::query()->orderBy('order_position')->paginate(12),
        ]);
    }

    public function portfolio(Portfolio $portfolio): Response
    {
        return Inertia::render('public/portfolio-detail', ['portfolio' => $portfolio]);
    }
}
