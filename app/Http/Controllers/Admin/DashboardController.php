<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Domain;
use App\Models\Order;
use App\Models\Portfolio;
use App\Models\WebService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'ordersByStatus' => Order::query()
                    ->selectRaw('status, count(*) as total')
                    ->groupBy('status')
                    ->pluck('total', 'status'),
                'activeWebServices' => WebService::query()->where('is_active', true)->count(),
                'availableDomains' => Domain::query()->where('is_available', true)->count(),
                'portfolios' => Portfolio::query()->count(),
            ],
        ]);
    }
}
