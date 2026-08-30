<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Notifications\OrderPendingPaymentNotification;
use App\Services\LiquidDomainRegistrar;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
                ->with(['webService:id,name', 'domain:id,extension'])
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
            'order' => $order->load(['webService:id,name', 'domain:id,extension']),
            'statuses' => self::STATUSES,
        ]);
    }

    public function update(Request $request, Order $order, LiquidDomainRegistrar $registrar): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(self::STATUSES)],
            'admin_notes' => ['nullable', 'string'],
            'action' => ['nullable', Rule::in(['approve_register'])],
        ]);

        if (($data['action'] ?? null) === 'approve_register') {
            $order->update(['status' => 'paid', 'paid_at' => $order->paid_at ?? now(), 'admin_notes' => $data['admin_notes'] ?? $order->admin_notes]);
            $registrar->register($order->refresh());

            return back();
        }

        $oldStatus = $order->status;
        $order->update([
            'status' => $data['status'],
            'admin_notes' => $data['admin_notes'] ?? null,
            'paid_at' => $data['status'] === 'paid' ? ($order->paid_at ?? now()) : $order->paid_at,
        ]);

        if ($oldStatus !== 'pending_payment' && $data['status'] === 'pending_payment') {
            Notification::route('mail', $order->client_email)->notify(new OrderPendingPaymentNotification($order));
        }

        return back();
    }
}
