<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Domain;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DomainsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/domains/index', [
            'domains' => Domain::query()->latest()->paginate(10),
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

    private function validated(Request $request, ?Domain $domain = null): array
    {
        $data = $request->validate([
            'extension' => ['required', 'string', 'max:20', 'unique:domains,extension,'.($domain?->id ?? 'NULL')],
            'price' => ['required', 'integer', 'min:0'],
            'is_available' => ['nullable', 'boolean'],
        ]);

        $data['is_available'] = $request->boolean('is_available');

        return $data;
    }
}
