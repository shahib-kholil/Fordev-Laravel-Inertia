<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Portfolio;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PortfoliosController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/portfolios/index', [
            'portfolios' => Portfolio::query()->latest()->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/portfolios/form');
    }

    public function store(Request $request): RedirectResponse
    {
        Portfolio::query()->create($this->validated($request));

        return to_route('admin.portfolios.index');
    }

    public function edit(Portfolio $portfolio): Response
    {
        return Inertia::render('admin/portfolios/form', ['portfolio' => $portfolio]);
    }

    public function update(Request $request, Portfolio $portfolio): RedirectResponse
    {
        $portfolio->update($this->validated($request, $portfolio));

        return to_route('admin.portfolios.index');
    }

    public function destroy(Portfolio $portfolio): RedirectResponse
    {
        $portfolio->delete();

        return back();
    }

    private function validated(Request $request, ?Portfolio $portfolio = null): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:portfolios,slug,'.($portfolio?->id ?? 'NULL')],
            'description' => ['nullable', 'string'],
            'image' => [$portfolio ? 'nullable' : 'required', 'image', 'max:2048'],
            'project_url' => ['nullable', 'url', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'is_featured' => ['nullable', 'boolean'],
            'order_position' => ['nullable', 'integer', 'min:0'],
        ]);

        $data['slug'] = $data['slug'] ?: Str::slug($data['title']);
        $data['is_featured'] = $request->boolean('is_featured');
        $data['order_position'] = $data['order_position'] ?? 0;

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('portfolios', 'public');
        } else {
            unset($data['image']);
        }

        return $data;
    }
}
