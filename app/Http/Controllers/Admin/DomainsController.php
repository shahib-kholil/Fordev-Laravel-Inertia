<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Domain;
use App\Models\DomainCoupon;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DomainsController extends Controller
{
    public function index(Request $request): Response
    {
        $bundles = collect(json_decode(Setting::query()->where('key', 'domain_bundles')->value('value') ?? '[]', true) ?: [])
            ->map(fn ($bundle) => [...$bundle, 'id' => $bundle['id'] ?? (string) Str::uuid()])
            ->values();

        return Inertia::render('admin/domains/index', [
            'filters' => ['q' => $request->query('q')],
            'domains' => Domain::query()
                ->when($request->query('q'), fn ($query, $q) => $query->where('extension', 'like', "%{$q}%"))
                ->orderBy('order_position')
                ->orderBy('id')
                ->paginate(10)
                ->withQueryString(),
            'bundles' => $bundles->map(fn ($bundle) => [...$bundle, 'coupons' => DomainCoupon::query()->where('bundle_id', $bundle['id'])->get(['id', 'code', 'value', 'starts_at', 'ends_at', 'max_uses', 'used_count', 'is_active'])])->all(),
            'domainOptions' => Domain::query()->orderBy('order_position')->orderBy('id')->get(['id', 'extension']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/domains/form');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $coupons = $data['coupons'] ?? [];
        unset($data['coupons']);
        $domain = Domain::query()->create($data);
        foreach ($coupons as $coupon) {
            foreach (['starts_at', 'ends_at'] as $field) {
                if (! empty($coupon[$field])) {
                    $coupon[$field] = Carbon::parse($coupon[$field], 'Asia/Jakarta')->utc();
                }
            }
            $domain->coupons()->create($coupon);
        }

        return to_route('admin.domains.index');
    }

    public function edit(Domain $domain): Response
    {
        return Inertia::render('admin/domains/form', [
            'domain' => $domain->load('coupons'),
        ]);
    }

    public function update(Request $request, Domain $domain): RedirectResponse
    {
        $domain->update($this->validated($request, $domain));

        return to_route('admin.domains.index');
    }

    public function destroy(Domain $domain): RedirectResponse
    {
        $domain->delete();

        return back();
    }

    public function reorder(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:domains,id'],
        ]);

        foreach ($data['ids'] as $index => $id) {
            Domain::query()->whereKey($id)->update(['order_position' => $index + 1]);
        }

        return back();
    }

    public function bundles(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'bundles' => ['nullable', 'array'],
            'bundles.*.name' => ['required', 'string', 'max:100'],
            'bundles.*.description' => ['nullable', 'string', 'max:500'],
            'bundles.*.domain_ids' => ['required', 'array', 'min:2'],
            'bundles.*.domain_ids.*' => ['integer', 'distinct', 'exists:domains,id'],
            'bundles.*.price' => ['required', 'integer', 'min:0'],
            'bundles.*.is_active' => ['boolean'],
            'bundles.*.id' => ['nullable', 'string', 'max:80'],
            'bundles.*.coupons' => ['nullable', 'array'],
            'bundles.*.coupons.*.id' => ['nullable', 'integer'],
            'bundles.*.coupons.*.code' => ['required', 'string', 'max:40', 'regex:/^[A-Z0-9_-]+$/'],
            'bundles.*.coupons.*.value' => ['required', 'integer', 'min:1'],
            'bundles.*.coupons.*.starts_at' => ['nullable', 'date'],
            'bundles.*.coupons.*.ends_at' => ['nullable', 'date'],
            'bundles.*.coupons.*.max_uses' => ['nullable', 'integer', 'min:1'],
            'bundles.*.coupons.*.is_active' => ['boolean'],
        ]);

        $bundles = collect($data['bundles'] ?? [])->map(function ($bundle) {
            $id = $bundle['id'] ?? (string) Str::uuid();
            foreach ($bundle['coupons'] ?? [] as $coupon) {
                DomainCoupon::query()->updateOrCreate(
                    ['id' => $coupon['id'] ?? null, 'bundle_id' => $id],
                    [...$coupon, 'bundle_id' => $id, 'domain_id' => null, 'code' => strtoupper($coupon['code']), 'type' => 'fixed'],
                );
            }
            unset($bundle['coupons']);

            return [...$bundle, 'id' => $id];
        });

        Setting::query()->updateOrCreate(
            ['key' => 'domain_bundles'],
            ['value' => json_encode($bundles->all())],
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Bundling domain berhasil disimpan.']);

        return back();
    }

    private function validated(Request $request, ?Domain $domain = null): array
    {
        $data = $request->validate([
            'extension' => ['required', 'string', 'max:20', 'unique:domains,extension,'.($domain?->id ?? 'NULL')],
            'price' => ['required', 'integer', 'min:0'],
            'promo_price' => ['nullable', 'integer', 'min:0'],
            'renewal_price' => ['nullable', 'integer', 'min:0'],
            'transfer_price' => ['nullable', 'integer', 'min:0'],
            'badge' => ['nullable', 'string', 'max:50'],
            'is_available' => ['nullable', 'boolean'],
            'coupons' => ['nullable', 'array'],
            'coupons.*.id' => ['nullable', 'integer'],
            'coupons.*.code' => ['required', 'string', 'max:40', 'regex:/^[A-Z0-9_-]+$/'],
            'coupons.*.type' => ['required', 'in:fixed'],
            'coupons.*.value' => ['required', 'integer', 'min:1', 'max:100000000'],
            'coupons.*.starts_at' => ['nullable', 'date'],
            'coupons.*.ends_at' => ['nullable', 'date', 'after_or_equal:coupons.*.starts_at'],
            'coupons.*.max_uses' => ['nullable', 'integer', 'min:1'],
            'coupons.*.is_active' => ['boolean'],
        ]);

        $data['is_available'] = $request->boolean('is_available');

        foreach ($data['coupons'] ?? [] as $coupon) {
            $basePrice = (int) ($domain?->promo_price ?: $domain?->price ?? $data['price']);
            abort_if((int) $coupon['value'] > $basePrice, 422, 'Harga akhir kupon tidak boleh melebihi harga domain.');
        }

        $coupons = $data['coupons'] ?? [];

        if ($domain) {
            unset($data['coupons']);
            $keep = collect($coupons)->pluck('id')->filter(
                fn ($id) => $domain->coupons()->whereKey($id)->exists(),
            );
            $domain->coupons()->whereNotIn('id', $keep)->delete();
            foreach ($coupons as $coupon) {
                foreach (['starts_at', 'ends_at'] as $field) {
                    if (! empty($coupon[$field])) {
                        $coupon[$field] = Carbon::parse($coupon[$field], 'Asia/Jakarta')->utc();
                    }
                }
                $existing = ! empty($coupon['id'])
                    ? $domain->coupons()->whereKey($coupon['id'])->first()
                    : null;
                $domain->coupons()->updateOrCreate(
                    ['id' => $existing?->id],
                    [...$coupon, 'code' => strtoupper(trim($coupon['code'])), 'is_active' => (bool) ($coupon['is_active'] ?? false)],
                );
            }
        }

        return $data;
    }
}
