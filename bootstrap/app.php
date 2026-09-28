<?php

use App\Http\Middleware\EnsureAdmin;
use App\Http\Middleware\EnsureSuperAdmin;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);
        $middleware->trustProxies(at: '*', headers: Request::HEADER_X_FORWARDED_FOR | Request::HEADER_X_FORWARDED_HOST | Request::HEADER_X_FORWARDED_PORT | Request::HEADER_X_FORWARDED_PROTO);
        $middleware->validateCsrfTokens(except: ['webhooks/borderpay']);
        $middleware->redirectGuestsTo(function (Request $request) {
            return $request->is('order')
                ? route('login', ['login_notice' => 'domain'])
                : route('login');
        });
        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
        ]);
        $middleware->append(SecurityHeaders::class);
        $middleware->alias(['admin' => EnsureAdmin::class, 'super_admin' => EnsureSuperAdmin::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (MethodNotAllowedHttpException $exception, Request $request) {
            return response('Method Not Allowed', 405, ['Allow' => (string) ($exception->getHeaders()['Allow'] ?? '')]);
        });
        $exceptions->render(function (ThrottleRequestsException $exception, Request $request) {
            if ($request->header('X-Inertia')) {
                return back()->withErrors([
                    'form' => 'Terlalu banyak percobaan. Silakan tunggu sebentar lalu coba lagi.',
                ]);
            }

            return back()->with('error', 'Terlalu banyak percobaan. Silakan tunggu sebentar lalu coba lagi.');
        });
        $exceptions->render(function (HttpExceptionInterface $exception, Request $request) {
            if ($exception->getStatusCode() !== 422 || $request->is('api/*') || $request->expectsJson() || (! $request->is('order') && ! $request->is('order/*'))) {
                return null;
            }

            return back()
                ->withErrors(['form' => $exception->getMessage() ?: 'Data pesanan belum valid. Periksa kembali isian Anda.'])
                ->withInput();
        });
        $exceptions->render(function (Throwable $exception, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            $status = method_exists($exception, 'getStatusCode')
                ? $exception->getStatusCode()
                : 500;

            return response()->json([
                'message' => $status === 404 ? 'Not Found.' : 'Server Error.',
            ], $status);
        });
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();
