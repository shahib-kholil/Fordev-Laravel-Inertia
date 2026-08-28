<?php

namespace App\Http\Controllers;

use App\Models\Domain;
use App\Models\Portfolio;
use App\Models\Testimonial;
use App\Models\WebService;
use Inertia\Inertia;
use Inertia\Response;

class PublicPageController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('public/home', [
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

    public function domains(): Response
    {
        return Inertia::render('public/domains', [
            'domains' => Domain::query()->where('is_available', true)->paginate(20),
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
