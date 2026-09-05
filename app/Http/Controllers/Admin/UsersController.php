<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UsersController extends Controller
{
    private const ROLES = ['user', 'admin', 'super_admin'];

    public function index(Request $request): Response
    {
        return Inertia::render('admin/users/index', [
            'users' => User::query()->when($request->query('q'), fn ($query, $q) => $query->where(fn ($query) => $query->where('name', 'like', "%{$q}%")->orWhere('email', 'like', "%{$q}%")))->latest()->paginate(15)->withQueryString(),
            'filters' => ['q' => $request->query('q')],
            'roles' => self::ROLES,
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate(['role' => ['required', Rule::in(self::ROLES)]]);
        abort_if($request->user()->is($user) && $data['role'] !== 'super_admin', 422, 'Super Admin tidak dapat menurunkan role dirinya sendiri.');
        $user->update($data);
        return back();
    }
}