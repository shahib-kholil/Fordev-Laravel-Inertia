<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        $googleUser = Socialite::driver('google')->user();
        $user = User::query()->where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())->first();

        if ($user) {
            $user->update(['google_id' => $googleUser->getId()]);
        } else {
            $user = User::query()->create([
                'name' => $googleUser->getName() ?: $googleUser->getNickname() ?: 'Google User',
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'password' => Str::random(40),
                'email_verified_at' => now(),
            ]);
        }

        Auth::login($user, true);

        return redirect()->intended('/dashboard');
    }
}
