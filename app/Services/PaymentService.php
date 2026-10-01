<?php

namespace App\Services;

use App\Jobs\RegisterPaidOrder;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class PaymentService
{
    public function __construct(private readonly BorderPayClient $borderPay) {}

    public function createManualPayment(Order $order): Payment
    {
        $existing = Payment::query()
            ->where('provider', 'manual')
            ->where('reference_id', $order->order_number)
            ->whereNotIn('status', ['expired', 'failed', 'cancelled'])
            ->latest('id')
            ->first();

        if ($existing) {
            return $existing;
        }

        $expired = Payment::query()
            ->where('provider', 'manual')
            ->where('reference_id', $order->order_number)
            ->first();

        if ($expired) {
            $expired->update([
                'status' => 'pending',
                'amount' => (int) $order->total_snapshot,
                'customer_pays' => (int) $order->total_snapshot,
                'merchant_receives' => (int) $order->total_snapshot,
                'expires_at' => null,
                'paid_at' => null,
            ]);

            return $expired->refresh();
        }

        return Payment::query()->updateOrCreate(
            ['provider' => 'manual', 'reference_id' => $order->order_number],
            [
                'order_id' => $order->id,
                'status' => 'pending',
                'amount' => (int) $order->total_snapshot,
                'fee' => 0,
                'customer_pays' => (int) $order->total_snapshot,
                'merchant_receives' => (int) $order->total_snapshot,
                'expires_at' => null,
                'paid_at' => null,
                'provider_payload' => ['type' => 'manual'],
            ],
        );
    }

    public function createGatewayCheckout(Order $order, ?string $method = null, ?string $bankCode = null): Payment
    {
        $referenceId = $order->order_number;
        $existing = Payment::query()
            ->where('provider', 'borderpay')
            ->where('reference_id', $referenceId)
            ->first();

        if ($existing) {
            return $existing;
        }

        $amount = (int) ($order->total_snapshot ?? 0);
        if ($amount < 1000) {
            throw new RuntimeException($amount > 0
                ? 'Minimal pembayaran otomatis adalah Rp1.000.'
                : 'Order belum memiliki total pembayaran yang valid.');
        }

        $returnUrl = config('services.borderpay.return_url');
        if (! is_string($returnUrl) || ! filter_var($returnUrl, FILTER_VALIDATE_URL) || parse_url($returnUrl, PHP_URL_SCHEME) !== 'https') {
            throw new RuntimeException('BORDERPAY_RETURN_URL harus berupa URL HTTPS publik.');
        }
        $returnUrl = rtrim($returnUrl, '/').'?order='.rawurlencode($referenceId);

        $response = $this->borderPay->createCheckoutSession(
            $amount,
            $referenceId,
            $returnUrl,
            $method,
            $bankCode,
        );

        try {
            return DB::transaction(fn () => Payment::query()->create([
                'order_id' => $order->id,
                'provider' => 'borderpay',
                'reference_id' => $referenceId,
                'provider_payment_id' => $response['id'] ?? null,
                'method' => $response['method'] ?? null,
                'status' => $response['status'] ?? 'pending',
                'amount' => $response['amount'] ?? $amount,
                'fee' => $response['fee'] ?? 0,
                'customer_pays' => $response['customer_pays'] ?? $amount,
                'merchant_receives' => $response['merchant_receives'] ?? $amount,
                'fee_borne_by' => $response['fee_borne_by'] ?? null,
                'checkout_url' => $response['checkout_url'] ?? $response['pay_url'] ?? null,
                'qr_string' => $response['qr_string'] ?? null,
                'va_number' => $response['va_number'] ?? null,
                'va_bank' => $response['va_bank'] ?? null,
                'expires_at' => $response['expires_at'] ?? null,
                'provider_payload' => $response,
            ]));
        } catch (QueryException $exception) {
            if ($exception->getCode() !== '23000') {
                throw $exception;
            }

            return Payment::query()
                ->where('provider', 'borderpay')
                ->where('reference_id', $referenceId)
                ->firstOrFail();
        }
    }

    public function cancelPending(Payment $payment): Payment
    {
        if ($payment->status !== 'pending') {
            throw new RuntimeException('Hanya pembayaran pending yang dapat dibatalkan.');
        }

        $response = $this->borderPay->cancelPayment($payment->reference_id);
        $status = $response['status'] ?? $response['data']['status'] ?? null;

        if ($status !== 'expired') {
            throw new RuntimeException('Gateway tidak mengonfirmasi pembatalan pembayaran.');
        }

        return DB::transaction(function () use ($payment, $response) {
            $payment = Payment::query()->lockForUpdate()->findOrFail($payment->id);
            if ($payment->status !== 'pending') {
                throw new RuntimeException('Pembayaran sudah berubah status dan tidak dapat dibatalkan.');
            }

            $payment->update([
                'status' => 'expired',
                'provider_payload' => $response,
            ]);

            return $payment->refresh();
        });
    }

    public function simulatePending(Payment $payment): Payment
    {
        if (! str_starts_with((string) config('services.borderpay.api_key'), 'bp_test_')) {
            throw new RuntimeException('Simulasi hanya tersedia pada mode test.');
        }

        if ($payment->status !== 'pending') {
            throw new RuntimeException('Hanya pembayaran pending yang dapat disimulasikan.');
        }

        $response = $this->borderPay->simulatePayment($payment->reference_id);
        $status = $response['status'] ?? $response['data']['status'] ?? null;

        if ($status !== 'paid') {
            throw new RuntimeException('Gateway tidak mengonfirmasi simulasi pembayaran.');
        }

        $payment = DB::transaction(function () use ($payment, $response) {
            $payment = Payment::query()->lockForUpdate()->findOrFail($payment->id);
            if ($payment->status !== 'pending') {
                throw new RuntimeException('Pembayaran sudah berubah status.');
            }

            $payment->update(['status' => 'paid', 'paid_at' => now(), 'provider_payload' => $response]);
            $payment->order->update(['status' => 'paid', 'paid_at' => now()]);

            return $payment->refresh();
        });

        RegisterPaidOrder::dispatch($payment->order_id);

        return $payment;
    }

    public function syncStatus(Payment $payment): Payment
    {
        $response = $this->borderPay->paymentStatus($payment->reference_id);
        $status = $response['status'] ?? $response['data']['status'] ?? null;
        $amount = (int) ($response['amount'] ?? $response['data']['amount'] ?? 0);

        if (! in_array($status, ['paid', 'expired', 'failed', 'refunded'], true)) {
            throw new RuntimeException('Status pembayaran dari gateway tidak valid.');
        }

        if ($amount < (int) $payment->amount) {
            throw new RuntimeException('Nominal pembayaran dari gateway tidak sesuai.');
        }

        $payment = DB::transaction(function () use ($payment, $status, $amount, $response) {
            $payment = Payment::query()->lockForUpdate()->findOrFail($payment->id);
            $payment->update([
                'status' => $status,
                'customer_pays' => max((int) $payment->customer_pays, $amount),
                'fee' => max(0, $amount - (int) $payment->amount),
                'paid_at' => $status === 'paid' ? ($payment->paid_at ?? now()) : $payment->paid_at,
                'provider_payload' => $response,
            ]);

            if ($status === 'paid' && $payment->order->status !== 'paid') {
                $payment->order->update(['status' => 'paid', 'paid_at' => now()]);
            }

            return $payment->refresh();
        });

        if ($status === 'paid' && $payment->order->status === 'paid') {
            RegisterPaidOrder::dispatch($payment->order_id);
        }

        return $payment;
    }
}

// ponytail: provider calls stay outside the DB transaction; only the local snapshot is transactional.
// The unique provider/reference constraint is the final race-safety guard.

// @phpstan-ignore-next-line
