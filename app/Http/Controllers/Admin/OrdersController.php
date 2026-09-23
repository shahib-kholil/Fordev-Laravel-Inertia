<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Notifications\OrderPendingPaymentNotification;
use App\Services\LiquidDomainRegistrar;
use App\Services\PaymentService;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrdersController extends Controller
{
    private const STATUSES = ['pending_confirmation', 'pending_payment', 'paid', 'registering', 'active', 'api_error', 'refund_needed', 'failed', 'cancelled'];

    public function index(Request $request): Response
    {
        return Inertia::render('admin/orders/index', [
            'filters' => ['q' => $request->query('q'), 'status' => $request->query('status')],
            'statuses' => self::STATUSES,
            'orders' => Order::query()
                ->with(['webService:id,name', 'domain:id,extension', 'items:id,order_id,domain_name,extension,status'])
                ->when($request->query('q'), fn ($query, $q) => $query->where(fn ($query) => $query
                    ->where('order_number', 'like', "%{$q}%")
                    ->orWhere('client_email', 'like', "%{$q}%")))
                ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
                ->latest()
                ->paginate(10)
                ->withQueryString(),
        ]);
    }

    public function show(Order $order): Response
    {
        return Inertia::render('admin/orders/show', [
            'order' => $order->load(['webService:id,name', 'domain:id,extension', 'items:id,order_id,domain_name,extension,status', 'items.domain:id,extension', 'payments:id,order_id,provider,reference_id,status,amount,checkout_url']),
            'statuses' => self::STATUSES,
        ]);
    }

    public function cancelPayment(Order $order, PaymentService $payments): RedirectResponse
    {
        $payment = $order->payments()->where('provider', 'borderpay')->latest()->firstOrFail();

        try {
            $payments->cancelPending($payment);
        } catch (ConnectionException|RequestException $exception) {
            report($exception);

            return back()->withErrors(['payment' => 'Gateway pembayaran sedang tidak dapat dihubungi.']);
        } catch (\RuntimeException $exception) {
            report($exception);

            return back()->withErrors(['payment' => 'Pembayaran tidak dapat dibatalkan.']);
        }

        return back()->with('payment_cancelled', 'Pembayaran berhasil dibatalkan.');
    }

    public function verifyManualPayment(Order $order): RedirectResponse
    {
        $payment = $order->payments()->where('provider', 'manual')->latest()->firstOrFail();
        abort_unless($payment->status === 'pending' && (int) $payment->amount === (int) $order->total_snapshot, 422, 'Pembayaran manual tidak valid.');
        $payment->update(['status' => 'paid', 'paid_at' => now(), 'provider_payload' => ['type' => 'manual', 'verified_by' => auth()->id(), 'verified_at' => now()->toIso8601String()]]);
        $order->update(['status' => 'paid', 'paid_at' => now()]);

        return back()->with('payment_verified', 'Pembayaran manual berhasil diverifikasi.');
    }

    public function syncPayment(Order $order, PaymentService $payments): RedirectResponse
    {
        $payment = $order->payments()->where('provider', 'borderpay')->latest()->firstOrFail();

        try {
            $payments->syncStatus($payment);
        } catch (ConnectionException|RequestException $exception) {
            report($exception);

            return back()->withErrors(['payment' => 'Gateway pembayaran sedang tidak dapat dihubungi.']);
        } catch (\RuntimeException $exception) {
            report($exception);

            return back()->withErrors(['payment' => 'Status pembayaran tidak dapat disinkronkan.']);
        }

        return back()->with('payment_synced', 'Status pembayaran berhasil disinkronkan.');
    }

    public function simulatePayment(Order $order, PaymentService $payments): RedirectResponse
    {
        $payment = $order->payments()->where('provider', 'borderpay')->latest()->firstOrFail();

        try {
            $payments->simulatePending($payment);
        } catch (ConnectionException|RequestException $exception) {
            report($exception);

            return back()->withErrors(['payment' => 'Gateway pembayaran sedang tidak dapat dihubungi.']);
        } catch (\RuntimeException $exception) {
            report($exception);

            return back()->withErrors(['payment' => 'Simulasi pembayaran tidak dapat diproses.']);
        }

        return back()->with('payment_simulated', 'Pembayaran test berhasil disimulasikan.');
    }

    public function update(Request $request, Order $order, LiquidDomainRegistrar $registrar): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(self::STATUSES)],
            'admin_notes' => ['nullable', 'string'],
            'action' => ['nullable', Rule::in(['approve_register'])],
        ]);

        if (($data['action'] ?? null) === 'approve_register') {
            abort_unless($order->payments()->whereIn('provider', ['borderpay', 'manual'])->where('status', 'paid')->exists(), 422, 'Pembayaran belum terverifikasi.');
            $order->update(['status' => 'paid', 'paid_at' => $order->paid_at ?? now(), 'admin_notes' => $data['admin_notes'] ?? $order->admin_notes]);
            $registrar->register($order->refresh());

            return back();
        }

        $oldStatus = $order->status;
        if ($data['status'] === 'paid') {
            abort_unless($order->payments()->where('provider', 'borderpay')->where('status', 'paid')->exists(), 422, 'Pembayaran BorderPay belum terverifikasi.');
        }
        $order->update([
            'status' => $data['status'],
            'admin_notes' => $data['admin_notes'] ?? null,
            'paid_at' => $data['status'] === 'paid' ? ($order->paid_at ?? now()) : $order->paid_at,
        ]);

        if (in_array($data['status'], ['cancelled', 'failed'], true) && $oldStatus !== $data['status']) {
            $usage = DB::table('domain_coupon_usages')->where('order_id', $order->id)->first();
            if ($usage) {
                DB::transaction(function () use ($usage) {
                    DB::table('domain_coupon_usages')->where('id', $usage->id)->delete();
                    DB::table('domain_coupons')->whereKey($usage->domain_coupon_id)->where('used_count', '>', 0)->decrement('used_count');
                });
            }
        }

        if ($oldStatus !== 'pending_payment' && $data['status'] === 'pending_payment') {
            Notification::route('mail', $order->client_email)->notify(new OrderPendingPaymentNotification($order));
        }

        return back();
    }
}
