<?php

namespace App\Http\Controllers;

use App\Models\Domain;
use App\Models\Order;
use App\Models\Setting;
use App\Models\WebService;
use App\Notifications\NewOrderNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('public/order-form', [
            'webServices' => WebService::query()->where('is_active', true)->get(),
            'domains' => Domain::query()->where('is_available', true)->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_if($request->filled('website_url'), 422);

        $data = $request->validate([
            'client_name' => ['required', 'string', 'max:255'],
            'client_email' => ['required', 'email', 'max:255'],
            'client_phone' => ['required', 'string', 'max:30'],
            'order_type' => ['required', Rule::in(['website', 'domain', 'both'])],
            'web_service_id' => ['required_if:order_type,website,both', 'nullable', 'exists:web_services,id'],
            'domain_id' => ['required_if:order_type,domain,both', 'nullable', 'exists:domains,id'],
            'domain_name' => ['required_if:order_type,domain,both', 'nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        $webService = isset($data['web_service_id']) ? WebService::find($data['web_service_id']) : null;
        $domain = isset($data['domain_id']) ? Domain::find($data['domain_id']) : null;

        $order = Order::query()->create([
            ...$data,
            'order_number' => 'FRD-'.now()->format('Ymd').'-'.Str::upper(Str::random(4)),
            'web_service_price_snapshot' => $webService?->price,
            'domain_price_snapshot' => $domain?->price,
        ]);

        $email = Setting::query()->where('key', 'contact_email')->value('value');
        if ($email) {
            Notification::route('mail', $email)->notify(new NewOrderNotification($order));
        }

        return to_route('orders.status')->with('order_number', $order->order_number);
    }

    public function status(): Response
    {
        return Inertia::render('public/order-status');
    }

    public function lookup(Request $request): Response
    {
        $data = $request->validate([
            'order_number' => ['required', 'string'],
            'client_email' => ['required', 'email'],
        ]);

        return Inertia::render('public/order-status', [
            'order' => Order::query()
                ->where('order_number', $data['order_number'])
                ->where('client_email', $data['client_email'])
                ->first(),
        ]);
    }
}
