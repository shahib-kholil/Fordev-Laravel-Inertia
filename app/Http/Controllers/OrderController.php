<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Models\Domain;
use App\Models\DomainCoupon;
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
    public function checkCoupon(Request $request)
    {
        $data = $request->validate([
            'domain_id' => ['required', 'integer', 'exists:domains,id'],
            'bundle_id' => ['nullable', 'string', 'max:80'],
            'coupon_code' => ['required', 'string', 'max:40', 'regex:/^[A-Za-z0-9_-]+$/'],
        ]);

        $coupon = DomainCoupon::query()
            ->when($data['bundle_id'] ?? null, fn ($query, $id) => $query->where('bundle_id', $id))
            ->when(! ($data['bundle_id'] ?? null), fn ($query) => $query->where('domain_id', $data['domain_id']))
            ->where('code', strtoupper($data['coupon_code']))
            ->first();

        abort_unless($coupon && $coupon->usable(), 422, 'Kode promo tidak berlaku.');

        if ($data['bundle_id'] ?? null) {
            $bundle = collect(json_decode(Setting::query()->where('key', 'domain_bundles')->value('value') ?? '[]', true))
                ->first(fn ($item) => ($item['id'] ?? null) === $data['bundle_id']);
            abort_unless($bundle && ($bundle['is_active'] ?? true), 422, 'Paket bundling tidak tersedia.');
            $price = (int) $bundle['price'];
        } else {
            $domain = Domain::findOrFail($data['domain_id']);
            $price = (int) ($domain->promo_price ?: $domain->price);
        }
        $discount = $coupon->discount($price);

        return response()->json([
            'message' => 'Kode promo berhasil diterapkan.',
            'discount' => $discount,
        ]);
    }

    public function create(Request $request, IndonesianLocationService $locations): Response
    {
        $bundles = json_decode(Setting::query()->where('key', 'domain_bundles')->value('value') ?? '[]', true) ?: [];
        $bundleId = $request->query('bundle_id');
        $bundle = $bundleId !== null ? collect($bundles)->first(fn ($item, $key) => ($item['id'] ?? (string) $key) === (string) $bundleId) : null;
        if ($bundle) {
            $bundle['domains'] = Domain::query()
                ->whereIn('id', $bundle['domain_ids'] ?? [])
                ->where('is_available', true)
                ->get(['id', 'extension', 'price', 'promo_price'])
                ->values()
                ->all();
        }

        $editRequested = $request->filled('edit');
        $editOrder = $editRequested
            ? Order::query()->where('order_number', $request->query('edit'))->where('client_email', $request->user()->email)->where('status', 'pending_confirmation')->first()
            : null;
        $bundleEditRequested = $editOrder?->bundle_id;
        if ($editOrder?->bundle_id) {
            $editOrder = null;
        }

        return Inertia::render('public/order-form', [
            'webServices' => WebService::query()->where('is_active', true)->get(),
            'domains' => Domain::query()->where('is_available', true)->get(),
            'locations' => $locations->all(),
            'defaults' => [
                'order_type' => old('order_type', request('type', 'website')),
                'domain_id' => old('domain_id', $editOrder?->domain_id ?? request('domain_id', $bundle['domains'][0]['id'] ?? '')),
                'domain_name' => old('domain_name', $editOrder?->domain_name ?? request('domain_name', '')),
                'bundle_id' => old('bundle_id', $bundleId),
                'client_phone' => old('client_phone', $editOrder?->client_phone ?? ''),
                'company' => old('company', $editOrder?->company ?? ''),
                'address_line_1' => old('address_line_1', $editOrder?->address_line_1 ?? ''),
                'city' => old('city', $editOrder?->city ?? ''),
                'state' => old('state', $editOrder?->state ?? ''),
                'zipcode' => old('zipcode', $editOrder?->zipcode ?? ''),
                'country_code' => old('country_code', $editOrder?->country_code ?? 'ID'),
                'notes' => old('notes', $editOrder?->notes ?? ''),
                'confirm_new_order' => old('confirm_new_order', false),
                'order_number' => old('order_number', $editOrder?->order_number ?? ''),
                'coupon_code' => old('coupon_code', $editOrder?->coupon_code_snapshot ?? ''),
                'coupon_discount' => old('coupon_discount', $editOrder?->domain_discount_snapshot ?? 0),
                'edit_error' => $bundleEditRequested
                    ? 'Pesanan bundling tidak dapat diedit. Buat pesanan baru jika ingin mengubah pilihannya.'
                    : ($editRequested && ! $editOrder
                        ? 'Pesanan sudah diproses atau tidak ditemukan, jadi tidak dapat diedit.'
                        : null),
            ],
            'buyer' => $request->user()->only(['name', 'email']),
            'pendingOrder' => Order::query()
                ->where('client_email', $request->user()->email)
                ->where('status', 'pending_confirmation')
                ->when($editOrder, fn ($query) => $query->where('id', '!=', $editOrder->id))
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
        $editing = $request->filled('order_number')
            ? Order::query()->where('order_number', $request->input('order_number'))->where('client_email', $request->user()->email)->where('status', 'pending_confirmation')->firstOrFail()
            : null;

        $bundles = json_decode(Setting::query()->where('key', 'domain_bundles')->value('value') ?? '[]', true) ?: [];
        $bundle = collect($bundles)->first(fn ($item, $key) => ($item['id'] ?? (string) $key) === (string) ($data['bundle_id'] ?? ''));
        abort_if($editing?->bundle_id, 422, 'Pesanan bundling tidak dapat diedit.');
        $bundleDomains = $bundle
            ? Domain::query()->whereIn('id', $bundle['domain_ids'] ?? [])->where('is_available', true)->get()->keyBy('id')
            : collect();
        if (($data['bundle_id'] ?? null) !== null) {
            abort_unless($bundle && $bundleDomains->count() === count($bundle['domain_ids'] ?? []) && $bundleDomains->count() > 1, 422, 'Paket domain tidak tersedia.');
        }

        abort_unless($bundle || ! empty($data['domain_id']), 422, 'Domain atau paket domain wajib dipilih.');
        $domain = $bundle ? $bundleDomains->first() : Domain::query()
            ->whereKey($data['domain_id'])
            ->where('is_available', true)
            ->first();
        abort_unless($domain, 422, 'Domain tidak tersedia.');
        abort_unless(! $editing || (int) $editing->domain_id === (int) $domain->id, 422, 'Ekstensi domain tidak dapat diubah saat mengedit pesanan.');
        $data['order_type'] = 'domain';
        $domainPrice = $editing
            ? (int) $editing->domain_price_snapshot
            : ($bundle ? (int) $bundle['price'] : ($domain?->promo_price ?: $domain?->price));
        $coupon = ! $editing && ! empty($data['coupon_code'])
            ? DomainCoupon::query()->where('code', strtoupper($data['coupon_code']))
                ->when($bundle, fn ($query) => $query->where('bundle_id', $data['bundle_id']))
                ->when(! $bundle, fn ($query) => $query->where('domain_id', $domain->id))
                ->first()
            : null;
        if ($editing) {
            $couponDiscount = (int) $editing->domain_discount_snapshot;
            $couponCode = $editing->coupon_code_snapshot;
        } else {
            abort_unless(! $data['coupon_code'] || ($coupon && $coupon->usable()), 422, 'Kupon tidak berlaku untuk domain ini.');
            abort_unless(! $coupon || $coupon->value <= $domainPrice, 422, 'Harga akhir kupon tidak valid.');
            $couponDiscount = $coupon?->discount($domainPrice) ?? 0;
            $domainPrice -= $couponDiscount;
            $couponCode = $coupon?->code;
        }
        $data['domain_id'] = $domain?->id;
        $bundleId = $data['bundle_id'] ?? null;
        unset($data['bundle_id'], $data['order_number'], $data['payment_method'], $data['coupon_code']);

        if ($domain) {
            $existing = Order::query()
                ->where('client_email', $request->user()->email)
                ->where('domain_id', $domain->id)
                ->where('status', 'pending_confirmation')
                ->when($editing, fn ($query) => $query->where('id', '!=', $editing->id))
                ->latest()
                ->first();

            if (! $editing && $existing && ! $request->boolean('confirm_new_order')) {
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

        $order = DB::transaction(function () use ($data, $request, $domainPrice, $domain, $bundle, $bundleId, $bundleDomains, $editing, $coupon, $couponDiscount, $couponCode) {
            if ($coupon) {
                $coupon = DomainCoupon::query()->lockForUpdate()->find($coupon->id);
                abort_unless($coupon && $coupon->usable(), 422, 'Kupon sudah tidak tersedia.');
                $couponAlreadyUsed = DB::table('domain_coupon_usages')
                    ->join('orders', 'orders.id', '=', 'domain_coupon_usages.order_id')
                    ->where('domain_coupon_usages.domain_coupon_id', $coupon->id)
                    ->where('domain_coupon_usages.user_id', $request->user()->id)
                    ->where('orders.status', '!=', 'pending_confirmation')
                    ->exists();
                abort_if(! $editing && $couponAlreadyUsed, 422, 'Kupon ini sudah pernah digunakan akun Anda.');
            }
            if ($editing) {
                $editing->update([...$data, 'domain_id' => $domain?->id, 'domain_price_snapshot' => $domainPrice, 'domain_discount_snapshot' => $couponDiscount, 'coupon_code_snapshot' => $couponCode, 'tax_snapshot' => (int) round($domainPrice * 0.11), 'total_snapshot' => (int) round($domainPrice * 1.11)]);

                return $editing;
            }
            $order = Order::query()->create([
                ...$data,
                'client_name' => $request->user()->name,
                'client_email' => $request->user()->email,
                'order_number' => 'FRD-'.now()->format('Ymd').'-'.Str::upper(Str::random(4)),
                'web_service_price_snapshot' => null,
                'domain_price_snapshot' => $domainPrice,
                'bundle_id' => $bundleId,
                'bundle_price_snapshot' => $bundle ? (int) $bundle['price'] : null,
                'bundle_discount_snapshot' => $bundle ? $couponDiscount : 0,
                'bundle_coupon_code_snapshot' => $bundle ? $couponCode : null,
                'domain_discount_snapshot' => $couponDiscount,
                'coupon_code_snapshot' => $couponCode,
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

            if ($coupon) {
                $usage = DB::table('domain_coupon_usages')
                    ->join('orders', 'orders.id', '=', 'domain_coupon_usages.order_id')
                    ->where('domain_coupon_usages.domain_coupon_id', $coupon->id)
                    ->where('domain_coupon_usages.user_id', $request->user()->id)
                    ->where('orders.status', 'pending_confirmation')
                    ->select('domain_coupon_usages.id')
                    ->first();

                if ($usage) {
                    DB::table('domain_coupon_usages')->where('id', $usage->id)->update([
                        'order_id' => $order->id,
                        'updated_at' => now(),
                    ]);
                } else {
                    DB::table('domain_coupon_usages')->insert([
                        'domain_coupon_id' => $coupon->id,
                        'user_id' => $request->user()->id,
                        'order_id' => $order->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $coupon->increment('used_count');
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
        $orders = $request->user()
            ? Order::query()
                ->where('client_email', $request->user()->email)
                ->with(['domain:id,extension', 'items.domain:id,extension'])
                ->latest()
                ->get()
            : collect();
        $orderNumber = $request->query('order') ?? $request->session()->get('order_number');

        return Inertia::render('public/order-status', [
            'paymentMethods' => $this->paymentMethods(),
            'paymentDetails' => json_decode(Setting::query()->where('key', 'payment_details')->value('value') ?? '{}', true),
            'orders' => $orders,
            'order' => $orders->firstWhere('order_number', $orderNumber) ?? $orders->first(),
        ]);
    }

    public function lookup(Request $request): Response|RedirectResponse
    {
        $data = $request->validate([
            'order_number' => ['required', 'string'],
            'client_email' => ['required', 'email'],
        ]);

        $order = Order::query()
            ->where('order_number', $data['order_number'])
            ->where('client_email', $data['client_email'])
            ->with(['domain:id,extension', 'items.domain:id,extension'])
            ->first();

        if (! $order) {
            return back()->withErrors([
                'order_number' => 'Pesanan tidak ditemukan. Periksa nomor pesanan dan email Anda.',
            ])->withInput();
        }

        return Inertia::render('public/order-status', [
            'paymentMethods' => $this->paymentMethods(),
            'paymentDetails' => json_decode(Setting::query()->where('key', 'payment_details')->value('value') ?? '{}', true),
            'order' => $order,
        ]);
    }

    private function paymentMethods(): array
    {
        $methods = json_decode(Setting::query()->where('key', 'payment_methods')->value('value') ?? '["qris","dana","bank_transfer"]', true);

        return is_array($methods) ? array_values(array_intersect($methods, ['qris', 'dana', 'bank_transfer'])) : [];
    }
}
