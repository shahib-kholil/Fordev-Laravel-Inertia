<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DomainsController;
use App\Http\Controllers\Admin\OrdersController;
use App\Http\Controllers\Admin\PortfoliosController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\TestimonialsController;
use App\Http\Controllers\Admin\WebServicesController;
use App\Http\Controllers\Admin\UsersController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PublicPageController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', [PublicPageController::class, 'home'])->name('home');
Route::get('jasa-web', [PublicPageController::class, 'webServices'])->name('public.web-services');
Route::get('jasa-web/{webService:slug}', [PublicPageController::class, 'webService'])->name('public.web-services.show');
Route::get('contact', [PublicPageController::class, 'contact'])->name('public.contact');
Route::get('domain', [PublicPageController::class, 'domains'])->name('public.domains');
Route::get('portofolio', [PublicPageController::class, 'portfolios'])->name('public.portfolios');
Route::get('portofolio/{portfolio:slug}', [PublicPageController::class, 'portfolio'])->name('public.portfolios.show');
Route::middleware('auth')->group(function () {
    Route::post('logout', function (\Illuminate\Http\Request $request) {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return to_route('home');
    })->name('logout');
    Route::get('order', [OrderController::class, 'create'])->name('orders.create')->middleware('throttle:20,1');
    Route::post('order', [OrderController::class, 'store'])->name('orders.store')->middleware('throttle:5,1');
});
Route::get('cek-status-pesanan', [OrderController::class, 'status'])->name('orders.status');
Route::post('cek-status-pesanan', [OrderController::class, 'lookup'])->name('orders.lookup')->middleware('throttle:10,1');
Route::get('auth/google/redirect', [GoogleController::class, 'redirect'])->name('auth.google.redirect');
Route::get('auth/google/callback', [GoogleController::class, 'callback'])->name('auth.google.callback');

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('admin/dashboard', DashboardController::class)->name('admin.dashboard');
    Route::put('admin/domains/reorder', [DomainsController::class, 'reorder'])->name('admin.domains.reorder');

    Route::resource('admin/web-services', WebServicesController::class)->names('admin.web-services')->except('show');
    Route::resource('admin/domains', DomainsController::class)->names('admin.domains')->except('show');
    Route::resource('admin/portfolios', PortfoliosController::class)->names('admin.portfolios')->except('show');
    Route::resource('admin/testimonials', TestimonialsController::class)->names('admin.testimonials')->except('show');
    Route::get('admin/settings', [SettingsController::class, 'edit'])->name('admin.settings.edit');
    Route::put('admin/settings', [SettingsController::class, 'update'])->name('admin.settings.update');
    Route::resource('admin/orders', OrdersController::class)->names('admin.orders')->only(['index', 'show', 'update']);
    Route::get('admin/users', [UsersController::class, 'index'])->name('admin.users.index');
    Route::put('admin/users/{user}', [UsersController::class, 'update'])->name('admin.users.update');
});

require __DIR__.'/settings.php';
