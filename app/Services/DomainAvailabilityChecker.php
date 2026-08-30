<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class DomainAvailabilityChecker
{
    public function check(string $name, string $extension): array
    {
        $domain = strtolower($name).'.'.ltrim(strtolower($extension), '.');

        return Cache::remember("domain-check:{$domain}", now()->addHours(6), function () use ($domain) {
            $available = $this->dnsAvailable($domain);

            return [
                'domain' => $domain,
                'available' => $available,
                'status' => $available ? 'available' : 'unavailable',
            ];
        });
    }

    private function dnsAvailable(string $domain): bool
    {
        $records = dns_get_record($domain, DNS_A + DNS_AAAA + DNS_CNAME + DNS_NS);

        return $records === [];
    }
}
