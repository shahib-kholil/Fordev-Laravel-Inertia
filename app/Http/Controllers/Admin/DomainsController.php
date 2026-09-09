<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Domain;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DomainsController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('admin/domains/index', [
            'filters' => ['q' => $request->query('q')],
            'domains' => Domain::query()
                ->when($request->query('q'), fn ($query, $q) => $query->where('extension', 'like', "%{$q}%"))
                ->orderBy('order_position')
                ->orderBy('id')
                ->paginate(10)
                ->withQueryString(),
            'bundles' => json_decode(Setting::query()->where('key', 'domain_bundles')->value('value') ?? '[]', true) ?: [],
            'domainOptions' => Domain::query()->orderBy('order_position')->orderBy('id')->get(['id', 'extension']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/domains/form');
    }

    public function store(Request $request): RedirectResponse
    {
        Domain::query()->create($this->validated($request));

        return to_route('admin.domains.index');
    }

    public function edit(Domain $domain): Response
    {
        return Inertia::render('admin/domains/form', [
            'domain' => $domain,
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
        ]);

        Setting::query()->updateOrCreate(
            ['key' => 'domain_bundles'],
            ['value' => json_encode($data['bundles'] ?? [])],
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
        ]);

        $data['is_available'] = $request->boolean('is_available');

        return $data;
    }
}
