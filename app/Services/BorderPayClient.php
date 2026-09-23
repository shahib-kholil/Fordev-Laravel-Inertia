<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

class BorderPayClient
{
    public function createCheckoutSession(int $amount, string $referenceId, string $returnUrl, ?string $method = null, ?string $bankCode = null): array
    {
        return $this->http()->post('/payments', array_filter([
            'amount' => $amount,
            'reference_id' => $referenceId,
            'return_url' => $returnUrl,
            'method' => $method,
            'bank_code' => $bankCode,
        ]))->throw()->json() ?? [];
    }

    public function paymentMethods(): array
    {
        return $this->http()->get('/payment-methods')->throw()->json() ?? [];
    }

    public function paymentStatus(string $referenceId): array
    {
        return $this->http()->get('/payments/'.rawurlencode($referenceId))->throw()->json() ?? [];
    }

    public function cancelPayment(string $referenceId): array
    {
        return $this->http()->post('/payments/'.rawurlencode($referenceId).'/cancel')->throw()->json() ?? [];
    }

    public function simulatePayment(string $referenceId): array
    {
        return $this->http()->post('/payments/'.rawurlencode($referenceId).'/simulate')->throw()->json() ?? [];
    }

    private function http(): PendingRequest
    {
        return Http::baseUrl(config('services.borderpay.base_url'))
            ->acceptJson()
            ->withToken(config('services.borderpay.api_key'))
            ->withOptions(['curl' => [CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4]])
            ->timeout(10)
            ->retry(2, 300);
    }
}

// ponytail: provider-specific response mapping stays out of the client until checkout needs it.
// Transport errors remain explicit instead of silently using stale fee data.

// @phpstan-ignore-next-line
