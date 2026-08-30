<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

class LiquidDomainClient
{
    public function check(string $name, string $extension): array
    {
        $domain = strtolower($name).'.'.ltrim(strtolower($extension), '.');
        $available = $this->available($name, $extension);

        return [
            'domain' => $domain,
            'available' => $available,
            'status' => $available === null ? 'manual_check' : ($available ? 'available' : 'unavailable'),
        ];
    }

    public function available(string $name, string $extension): ?bool
    {
        if (! $this->configured()) {
            return null;
        }

        $domain = strtolower($name).'.'.ltrim(strtolower($extension), '.');

        try {
            $response = $this->http()->get('/domains', [
                'limit' => 1,
                'tld' => ltrim(strtolower($extension), '.'),
                'exact_domain_name' => $domain,
            ]);
        } catch (ConnectionException) {
            return null;
        }

        if (! $response->successful()) {
            return null;
        }

        return $response->json() === [];
    }

    /** @throws RequestException */
    public function signupCustomer(Order $order): string
    {
        $response = $this->http()->post('/customers/signup', [
            'email' => $order->client_email,
            'name' => $order->client_name,
            'password' => str()->password(16),
            'company' => $order->client_name,
            'address_line_1' => '-',
            'city' => '-',
            'state' => '-',
            'country_code' => 'ID',
            'zipcode' => '00000',
            'tel_cc_no' => 62,
            'tel_no' => preg_replace('/\D+/', '', $order->client_phone),
        ])->throw();

        return (string) ($response->json('customer_id') ?? $response->json('ID pelanggan') ?: throw new RequestException($response));
    }

    /** @throws RequestException */
    public function registerDomain(Order $order, string $customerId): array
    {
        $response = $this->http()->post('/domains/register', [
            'domain_name' => strtolower($order->domain_name).$order->domain->extension,
            'customer_id' => $customerId,
            'reg_contact_id' => $customerId,
            'adm_contact_id' => $customerId,
            'billing_contact_id' => $customerId,
            'tech_contact_id' => $customerId,
            'period' => 1,
        ])->throw();

        return $response->json() ?? [];
    }

    private function configured(): bool
    {
        return filled(config('services.liquid.reseller_id')) && filled(config('services.liquid.api_key'));
    }

    private function http(): PendingRequest
    {
        return Http::baseUrl(config('services.liquid.base_url'))
            ->acceptJson()
            ->asJson()
            ->withBasicAuth(config('services.liquid.reseller_id'), config('services.liquid.api_key'))
            ->timeout(10)
            ->retry(2, 300);
    }
}
