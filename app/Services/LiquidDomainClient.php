<?php

namespace App\Services;

use InvalidArgumentException;

use App\Models\Order;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class LiquidDomainClient
{
    public function balance(): int|float|array
    {
        return $this->http()->get('/account/balance')->throw()->json();
    }

    public function prices(): array
    {
        return Cache::remember('liquid:prices', now()->addMinutes(10), function () {
            return $this->http()->get('/account/prices')->throw()->json() ?? [];
        });
    }

    public function freshPrices(): array
    {
        Cache::forget('liquid:prices');

        return $this->prices();
    }

    public function priceFor(string $extension): int|float|null
    {
        if (! $this->configured()) {
            return null;
        }

        $price = $this->prices()[ltrim(strtolower($extension), '.')] ?? null;

        return $price['register'] ?? $price['registration'] ?? null;
    }

    public function transactions(array $query = []): array
    {
        return $this->http()->get('/account/transactions', $query)->throw()->json() ?? [];
    }

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
            $response = $this->http()->get('/domains/availability', [
                'domain' => $domain,
            ]);
        } catch (ConnectionException) {
            return null;
        }

        if (! $response->successful()) {
            return null;
        }

        $payload = $response->json();
        $status = $payload[0][$domain]['status'] ?? null;

        return $status === null ? null : $status === 'available';
    }

    /** @throws RequestException */
    public function signupCustomer(Order $order): string
    {
        $existing = $this->http()->get('/customers', ['email' => $order->client_email])->throw()->json();
        $customerId = $existing[0]['customer_id'] ?? $existing[0]['id'] ?? null;
        if ($customerId) {
            return (string) $customerId;
        }

        $response = $this->http()->asForm()->post('/customers', [
            'email' => $order->client_email,
            'name' => $order->client_name,
            'password' => str()->password(15),
            'company' => $order->client_name,
            'address_line_1' => 'Indonesia',
            'city' => 'Paser',
            'state' => 'Jawa Timur',
            'country_code' => 'ID',
            'zipcode' => '69400',
            'tel_cc_no' => '62',
            'tel_no' => $this->telephoneNumber($order->client_phone),
        ])->throw();

        return (string) ($response->json('customer_id') ?? $response->json('id') ?? throw new RequestException($response));
    }

    /** @throws RequestException */
    public function createContact(Order $order, string $customerId): string
    {
        $response = $this->http()->asForm()->post("/customers/{$customerId}/contacts", [
            'name' => $order->client_name,
            'company' => $order->client_name,
            'email' => $order->client_email,
            'address_line_1' => 'Indonesia',
            'city' => 'Paser',
            'country_code' => 'id',
            'state' => 'Jawa Timur',
            'zipcode' => '69400',
            'tel_cc_no' => '62',
            'tel_no' => $this->telephoneNumber($order->client_phone),
        ])->throw();

        return (string) ($response->json('contact_id') ?? $response->json('id') ?? throw new RequestException($response));
    }

    /** @throws RequestException */
    public function registerDomain(Order $order, string $customerId, string $contactId): array
    {
        $response = $this->http()->asForm()->post('/domains', [
            'domain_name' => strtolower($order->domain_name).$order->domain->extension,
            'customer_id' => $customerId,
            'registrant_contact_id' => $contactId,
            'admin_contact_id' => $contactId,
            'billing_contact_id' => $contactId,
            'tech_contact_id' => $contactId,
            'years' => 1,
            'invoice_option' => 'no_invoice',
        ])->throw();

        return $response->json() ?? [];
    }

    /** @throws RequestException */
    public function domainDetailsByName(string $domain): array
    {
        return $this->http()->get('/domains/details-by-name', [
            'domain_name' => strtolower($domain),
        ])->throw()->json() ?? [];
    }

    private function telephoneNumber(string $phone): string
    {
        $number = preg_replace('/\D+/', '', $phone);
        $number = preg_replace('/^62/', '0', $number);

        if ($number === '' || ! preg_match('/^0\d{11}$/', $number)) {
            throw new InvalidArgumentException('Nomor WhatsApp harus berisi tepat 12 digit, diawali 0.');
        }

        return $number;
    }

    private function configured(): bool
    {
        return filled(config('services.liquid.reseller_id')) && filled(config('services.liquid.api_key'));
    }

    private function http(): PendingRequest
    {
        $request = Http::baseUrl(config('services.liquid.base_url'))
            ->acceptJson()
            ->asJson()
            ->withBasicAuth(config('services.liquid.reseller_id'), config('services.liquid.api_key'))
            ->timeout(10)
            ->retry(2, 300);

        if (filled(config('services.liquid.http_proxy'))) {
            $request = $request->withOptions(['proxy' => config('services.liquid.http_proxy')]);
        }

        return $request;
    }
}
