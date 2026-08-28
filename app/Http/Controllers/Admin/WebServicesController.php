<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WebService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class WebServicesController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/web-services/index', [
            'webServices' => WebService::query()->latest()->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/web-services/form');
    }

    public function store(Request $request): RedirectResponse
    {
        WebService::query()->create($this->validated($request));

        return to_route('admin.web-services.index');
    }

    public function edit(WebService $webService): Response
    {
        return Inertia::render('admin/web-services/form', [
            'webService' => $webService,
        ]);
    }

    public function update(Request $request, WebService $webService): RedirectResponse
    {
        $webService->update($this->validated($request, $webService));

        return to_route('admin.web-services.index');
    }

    public function destroy(WebService $webService): RedirectResponse
    {
        $webService->delete();

        return back();
    }

    private function validated(Request $request, ?WebService $webService = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:web_services,slug,'.($webService?->id ?? 'NULL')],
            'description' => ['required', 'string'],
            'price' => ['required', 'integer', 'min:0'],
            'features' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['slug'] = $data['slug'] ?: Str::slug($data['name']);
        $data['features'] = array_values(array_filter(array_map('trim', explode("\n", $data['features'] ?? ''))));
        $data['is_active'] = $request->boolean('is_active');

        return $data;
    }
}
