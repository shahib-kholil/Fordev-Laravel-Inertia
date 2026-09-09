<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Models\Domain;
use App\Models\Order;
use App\Models\Setting;
use App\Models\WebService;
use App\Notifications\NewOrderNotification;
use App\Services\IndonesianLocationService;
use App\Services\LiquidDomainClient;
use App\Services\TelegramNotifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function create(Request $request, IndonesianLocationService $locations): Response
    {
        $bundles = json_decode(Setting::query()->where('key', 'domain_bundles')->value('value') ?? '[]', true) ?: [];
        $bundleId = $request->query('bundle_id');
        $bundle = $bundleId !== null ? ($bundles[$bundleId] ?? null) : null;
        if ($bundle) {
            $bundle['domains'] = Domain::query()
                ->whereIn('id', $bundle['domain_ids'] ?? [])
                ->where('is_available', true)
                ->get(['id', 'extension', 'price', 'promo_price'])
                ->values()
                ->all();
        }

        return Inertia::render('public/order-form', [
            'webServices' => WebService::query()->where('is_active', true)->get(),
            'domains' => Domain::query()->where('is_available', true)->get(),
            'locations' => $locations->all(),
            'defaults' => [
                'order_type' => request('type', 'website'),
                'domain_id' => request('domain_id', $bundle['domains'][0]['id'] ?? ''),
                'domain_name' => request('domain_name', ''),
                'bundle_id' => $bundleId,
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
            'bundle' => $bundle,
        ]);
    }

    public function store(StoreOrderRequest $request, LiquidDomainClient $liquid, TelegramNotifier $telegram): RedirectResponse
    {

        abort_if($request->filled('website_url'), 422);

        $data = $request->validated();

        $bundles = json_decode(Setting::query()->where('key', 'domain_bundles')->value('value') ?? '[]', true) ?: [];
        $bundle = array_key_exists($data['bundle_id'] ?? null, $bundles) ? $bundles[$data['bundle_id']] : null;
        $bundleDomains = $bundle
            ? Domain::query()->whereIn('id', $bundle['domain_ids'] ?? [])->where('is_available', true)->get()->keyBy('id')
            : collect();
        if (($data['bundle_id'] ?? null) !== null) {
            abort_unless($bundle && $bundleDomains->count() === count($bundle['domain_ids'] ?? []) && $bundleDomains->count() > 1, 422, 'Paket domain tidak tersedia.');
        }

        abort_unless($bundle || ! empty($data['domain_id']), 422, 'Domain atau paket domain wajib dipilih.');
        $domain = $bundle ? $bundleDomains->first() : Domain::find($data['domain_id']);
        $data['order_type'] = 'domain';
        $domainPrice = $bundle ? (int) $bundle['price'] : ($domain?->promo_price ?: $domain?->price);
        $data['domain_id'] = $domain?->id;
        unset($data['bundle_id']);

        if ($domain) {
            $existing = Order::query()
                ->where('client_email', $request->user()->email)
                ->where('domain_id', $domain->id)
                ->where('status', 'pending_confirmation')
                ->latest()
                ->first();

            if ($existing && ! $request->boolean('confirm_new_order')) {
                return back()
                    ->withErrors(['pending_order' => "Kamu masih memiliki pesanan {$existing->order_number} yang belum selesai."])
                    ->with('pending_order_number', $existing->order_number)
                    ->withInput();
            }

            $availabilityDomains = $bundle ? $bundleDomains : collect([$domain]);
            foreach ($availabilityDomains as $availabilityDomain) {
                $available = $liquid->available($data['domain_name'], $availabilityDomain->extension);

                if ($available === false) {
                    return back()->withErrors([
                        'domain_name' => "Domain {$data['domain_name']}{$availabilityDomain->extension} tidak tersedia di Liqu.id.",
                    ])->withInput();
                }
            }
        }

        $order = DB::transaction(function () use ($data, $request, $domainPrice, $domain, $bundle, $bundleDomains) {
            $order = Order::query()->create([
                ...$data,
                'client_name' => $request->user()->name,
                'client_email' => $request->user()->email,
                'order_number' => 'FRD-'.now()->format('Ymd').'-'.Str::upper(Str::random(4)),
                'web_service_price_snapshot' => null,
                'domain_price_snapshot' => $domainPrice,
                'domain_discount_snapshot' => $domain ? max(0, $domain->price - $domainPrice) : null,
                'icann_fee_snapshot' => 0,
                'whois_privacy_snapshot' => 0,
                'tax_snapshot' => $domainPrice ? (int) round($domainPrice * 0.11) : 0,
                'total_snapshot' => $domainPrice ? (int) round($domainPrice * 1.11) : null,
                'status' => 'pending_confirmation',
            ]);

            if ($bundle) {
                $itemPrice = intdiv($domainPrice, $bundleDomains->count());
                foreach ($bundleDomains as $bundleDomain) {
                    $order->items()->create([
                        'domain_id' => $bundleDomain->id,
                        'domain_name' => $data['domain_name'],
                        'extension' => $bundleDomain->extension,
                        'price_snapshot' => $itemPrice,
                        'discount_snapshot' => max(0, (int) ($bundleDomain->promo_price ?: $bundleDomain->price) - $itemPrice),
                        'tax_snapshot' => (int) round($itemPrice * 0.11),
                    ]);
                }
            }

            return $order;
        });

        $email = Setting::query()->where('key', 'contact_email')->value('value');
        if ($email) {
            Notification::route('mail', $email)->notify(new NewOrderNotification($order));
        }
        $telegram->orderCreated($order);

        return to_route('orders.status', ['order' => $order->order_number]);
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
                    ->with(['domain:id,extension', 'items.domain:id,extension'])
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
