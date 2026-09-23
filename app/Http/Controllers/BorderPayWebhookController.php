<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BorderPayWebhookController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $expectedToken = (string) config('services.borderpay.webhook_token');
        $receivedToken = (string) $request->header('x-borderpay-token');

        abort_unless($expectedToken !== '' && hash_equals($expectedToken, $receivedToken), 401);

        $expectedMode = str_starts_with((string) config('services.borderpay.api_key'), 'bp_live_') ? 'live' : 'test';
        abort_unless($request->header('x-borderpay-mode') === $expectedMode, 422);

        $data = $request->validate([
            'event' => ['required', 'in:payment.paid,payment.expired,payment.failed,payment.refunded'],
            'data.reference_id' => ['required', 'string', 'max:64'],
            'data.mode' => ['required', 'same:mode'],
            'data.status' => ['required', 'in:paid,expired,failed,refunded'],
            'data.amount' => ['required', 'integer', 'min:1'],
            'mode' => ['required', 'in:test,live'],
        ]);

        abort_unless($data['mode'] === $expectedMode && $data['data']['mode'] === $expectedMode, 422);
        abort_unless(str_replace('payment.', '', $data['event']) === $data['data']['status'], 422);

        $payment = DB::transaction(function () use ($data, $request) {
            $payment = Payment::query()
                ->where('provider', 'borderpay')
                ->where('reference_id', $data['data']['reference_id'])
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless((int) $payment->amount === (int) $data['data']['amount'], 422);

            $status = match ($data['event']) {
                'payment.paid' => 'paid',
                'payment.expired' => 'expired',
                'payment.failed' => 'failed',
                'payment.refunded' => 'refunded',
            };

            $allowed = match ($payment->status) {
                'pending' => ['paid', 'expired', 'failed'],
                'paid' => ['paid', 'refunded'],
                'refunded', 'expired', 'failed' => [$payment->status],
                default => [],
            };
            abort_unless(in_array($status, $allowed, true), 409);

            $payment->update([
                'status' => $status,
                'paid_at' => $status === 'paid' ? ($payment->paid_at ?? now()) : $payment->paid_at,
                'provider_payload' => $request->all(),
            ]);

            if ($status === 'paid' && in_array($payment->order->status, ['pending_payment', 'pending_confirmation'], true)) {
                $payment->order->update(['status' => 'paid', 'paid_at' => now()]);
            }

            return $payment;
        });

        return response()->json(['ok' => true, 'payment_id' => $payment->id]);
    }
}

// ponytail: provider_payload is the webhook audit snapshot; payment status remains the typed source for queries.
// @phpstan-ignore-next-line
