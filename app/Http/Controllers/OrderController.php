<?php

namespace App\Http\Controllers;

use App\Models\Domain;
use App\Models\Order;
use App\Models\Setting;
use App\Models\WebService;
use App\Notifications\NewOrderNotification;
use App\Services\LiquidDomainClient;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('public/order-form', [
            'webServices' => WebService::query()->where('is_active', true)->get(),
            'domains' => Domain::query()->where('is_available', true)->get(),
            'defaults' => [
                'order_type' => request('type', 'website'),
                'domain_id' => request('domain_id', ''),
                'domain_name' => request('domain_name', ''),
            ],
            'buyer' => $request->user()->only(['name', 'email']),
            'pendingOrder' => Order::query()
                ->where('client_email', $request->user()->email)
                ->where('status', 'pending_confirmation')
                ->when(request('domain_id'), fn ($query, $domainId) => $query->where('domain_id', $domainId))
                ->latest()
                ->first(['order_number', 'domain_id']),
            'paymentMethods' => json_decode(Setting::query()->where('key', 'payment_methods')->value('value') ?? '["qris","dana","bank_transfer"]', true),
            'paymentDetails' => json_decode(Setting::query()->where('key', 'payment_details')->value('value') ?? '{}', true),
        ]);
    }

    public function store(Request $request, LiquidDomainClient $liquid): RedirectResponse
    {
        abort_if($request->filled('website_url'), 422);

        $data = $request->validate([
            'client_phone' => ['required', 'string', 'regex:/^[0-9+()\s-]{8,30}$/'],
            'order_type' => ['required', Rule::in(['website', 'domain', 'both'])],
            'web_service_id' => ['required_if:order_type,website,both', 'nullable', 'exists:web_services,id'],
            'domain_id' => ['required_if:order_type,domain,both', 'nullable', 'exists:domains,id'],
            'domain_name' => ['required_if:order_type,domain,both', 'nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'payment_method' => ['nullable', Rule::in(['qris', 'dana', 'bank_transfer'])],
        ]);

        $webService = isset($data['web_service_id']) ? WebService::find($data['web_service_id']) : null;
        $domain = isset($data['domain_id']) ? Domain::find($data['domain_id']) : null;
        $domainPrice = $domain && in_array($data['order_type'], ['domain', 'both'], true)
            ? ($domain->promo_price ?: $domain->price)
            : null;

        if ($domain && in_array($data['order_type'], ['domain', 'both'], true)) {
            $existing = Order::query()
                ->where('client_email', $request->user()->email)
                ->where('domain_id', $domain->id)
                ->where('status', 'pending_confirmation')
                ->latest()
                ->first();

            if ($existing && !$request->boolean('confirm_new_order')) {
                return back()
                    ->withErrors(['pending_order' => "Kamu masih memiliki pesanan {$existing->order_number} yang belum selesai."])
                    ->with('pending_order_number', $existing->order_number)
                    ->withInput();
            }

            $available = $liquid->available($data['domain_name'], $domain->extension);

            if ($available === false) {
                return back()->withErrors(['domain_name' => 'Domain ini tidak tersedia di Liqu.id.'])->withInput();
            }
        }

        $order = Order::query()->create([
            ...$data,
            'client_name' => $request->user()->name,
            'client_email' => $request->user()->email,
            'order_number' => 'FRD-'.now()->format('Ymd').'-'.Str::upper(Str::random(4)),
            'web_service_price_snapshot' => $webService?->price,
            'domain_price_snapshot' => $domainPrice,
            'domain_discount_snapshot' => $domain ? max(0, $domain->price - $domainPrice) : null,
            'icann_fee_snapshot' => $domain ? 3313 : 0,
            'whois_privacy_snapshot' => 0,
            'tax_snapshot' => $domainPrice ? (int) round($domainPrice * 0.11) : 0,
            'total_snapshot' => $domainPrice ? (int) round($domainPrice * 1.11) + 3313 : null,
            'status' => 'pending_confirmation',
        ]);

        $email = Setting::query()->where('key', 'contact_email')->value('value');
        if ($email) {
            Notification::route('mail', $email)->notify(new NewOrderNotification($order));
        }

        return to_route('orders.status')->with('order_number', $order->order_number);
    }

    public function status(Request $request): Response
    {
        return Inertia::render('public/order-status', [
            'paymentDetails' => json_decode(Setting::query()->where('key', 'payment_details')->value('value') ?? '{}', true),
            'order' => $request->user()
                ? Order::query()
                    ->where('client_email', $request->user()->email)
                    ->when(
                        $request->query('order') ?? $request->session()->get('order_number'),
                        fn ($query, $number) => $query->where('order_number', $number),
                        fn ($query) => $query->whereRaw('1 = 0'),
                    )
                    ->with('domain:id,extension')
                    ->first()
                : null,
        ]);
    }

    public function lookup(Request $request): Response
    {
        $data = $request->validate([
            'order_number' => ['required', 'string'],
            'client_email' => ['required', 'email'],
        ]);

        return Inertia::render('public/order-status', [
            'paymentDetails' => json_decode(Setting::query()->where('key', 'payment_details')->value('value') ?? '{}', true),
            'order' => Order::query()
                ->where('order_number', $data['order_number'])
                ->where('client_email', $data['client_email'])
                ->first(),
        ]);
    }
}
