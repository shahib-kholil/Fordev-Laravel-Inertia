<?php

namespace Tests\Unit;

use App\Services\BorderPayClient;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class BorderPayClientTest extends TestCase
{
    public function test_payment_status_encodes_reference_in_path(): void
    {
        config([
            'services.borderpay.base_url' => 'https://borderpay.test/api/v1',
            'services.borderpay.api_key' => 'bp_test_example',
        ]);
        Http::fake([
            'https://borderpay.test/api/v1/payments/FRD%2FTEST%2F001' => Http::response([
                'reference_id' => 'FRD/TEST/001',
                'status' => 'paid',
            ]),
        ]);

        $payment = app(BorderPayClient::class)->paymentStatus('FRD/TEST/001');

        $this->assertSame('paid', $payment['status']);
        Http::assertSent(fn ($request) => $request->method() === 'GET'
            && $request->url() === 'https://borderpay.test/api/v1/payments/FRD%2FTEST%2F001');
    }

    public function test_checkout_session_sends_idempotent_reference_and_return_url(): void
    {
        config([
            'services.borderpay.base_url' => 'https://borderpay.test/api/v1',
            'services.borderpay.api_key' => 'bp_test_example',
        ]);
        Http::fake([
            'https://borderpay.test/api/v1/payments' => Http::response([
                'type' => 'session',
                'reference_id' => 'FRD-TEST-001',
                'status' => 'pending',
                'checkout_url' => 'https://borderpay.test/checkout/1',
            ], 201),
        ]);

        $payment = app(BorderPayClient::class)->createCheckoutSession(
            150000,
            'FRD-TEST-001',
            'https://fordev.test/cek-status-pesanan?order=FRD-TEST-001',
        );

        $this->assertSame('https://borderpay.test/checkout/1', $payment['checkout_url']);
        Http::assertSent(fn ($request) => $request->url() === 'https://borderpay.test/api/v1/payments'
            && $request->method() === 'POST'
            && $request->hasHeader('Authorization', 'Bearer bp_test_example')
            && $request['amount'] === 150000
            && $request['reference_id'] === 'FRD-TEST-001'
            && $request['return_url'] === 'https://fordev.test/cek-status-pesanan?order=FRD-TEST-001');
    }

    public function test_cancel_payment_posts_reference(): void
    {
        config([
            'services.borderpay.base_url' => 'https://borderpay.test/api/v1',
            'services.borderpay.api_key' => 'bp_test_example',
        ]);
        Http::fake(['https://borderpay.test/api/v1/payments/ORDER-1/cancel' => Http::response(['status' => 'expired'])]);

        $this->assertSame(['status' => 'expired'], app(BorderPayClient::class)->cancelPayment('ORDER-1'));
        Http::assertSent(fn ($request) => $request->url() === 'https://borderpay.test/api/v1/payments/ORDER-1/cancel' && $request->method() === 'POST');
    }

    public function test_simulate_payment_posts_reference(): void
    {
        config(['services.borderpay.base_url' => 'https://borderpay.test/api/v1', 'services.borderpay.api_key' => 'bp_test_example']);
        Http::fake(['https://borderpay.test/api/v1/payments/ORDER-1/simulate' => Http::response(['status' => 'paid'])]);

        $this->assertSame(['status' => 'paid'], app(BorderPayClient::class)->simulatePayment('ORDER-1'));
        Http::assertSent(fn ($request) => $request->url() === 'https://borderpay.test/api/v1/payments/ORDER-1/simulate' && $request->method() === 'POST');
    }

    public function test_payment_methods_are_requested_with_bearer_auth(): void
    {
        config([
            'services.borderpay.base_url' => 'https://borderpay.test/api/v1',
            'services.borderpay.api_key' => 'bp_test_example',
        ]);
        Http::fake([
            'https://borderpay.test/api/v1/payment-methods' => Http::response([
                'qris' => ['enabled' => true],
            ]),
        ]);

        $methods = app(BorderPayClient::class)->paymentMethods();

        $this->assertSame(['qris' => ['enabled' => true]], $methods);
        Http::assertSent(fn ($request) => $request->hasHeader('Authorization', 'Bearer bp_test_example'));
    }
}

// ponytail: this test deliberately uses Http::fake; live credentials are never needed for unit verification.

// @phpstan-ignore-next-line
