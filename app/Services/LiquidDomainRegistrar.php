<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use App\Notifications\DomainRegistrationFailedNotification;
use App\Notifications\OrderActiveNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Throwable;

class LiquidDomainRegistrar
{
    public function __construct(private readonly LiquidDomainClient $liquid) {}

    private function registerItems(Order $order): void
    {
        $user = User::query()->where('email', $order->client_email)->first();
        $customerId = $order->liquid_customer_id ?: $user?->liquid_customer_id ?: $this->liquid->signupCustomer($order);
        $contactId = $this->liquid->createContact($order, $customerId);
        $user?->update(['liquid_customer_id' => $customerId]);
        $order->update(['liquid_customer_id' => $customerId]);

        foreach ($order->items as $item) {
            if ($item->status === 'active') {
                continue;
            }

            $item->update(['status' => 'registering', 'liquid_error' => null]);
            try {
                $available = $this->liquid->available($item->domain_name, $item->extension);
                if ($available === false) {
                    $item->update(['status' => 'refund_needed', 'liquid_error' => 'Domain sudah tidak tersedia saat approval.']);

                    continue;
                }

                $registered = $this->liquid->registerDomainName($item->domain_name.$item->extension, $customerId, $contactId);
                $details = $this->liquid->domainDetailsByName(strtolower($item->domain_name).$item->extension);
                $item->update([
                    'status' => 'active',
                    'liquid_domain_id' => $details['domain_id'] ?? $registered['domain_id'] ?? $registered['id'] ?? null,
                    'registered_at' => now(),
                ]);
            } catch (Throwable $e) {
                $item->update(['status' => 'api_error', 'liquid_error' => $e->getMessage()]);
            }
        }

        $hasErrors = $order->items()->whereIn('status', ['api_error', 'refund_needed', 'failed'])->exists();
        $allActive = ! $order->items()->where('status', '!=', 'active')->exists();
        $order->update([
            'status' => $allActive ? 'active' : ($hasErrors ? 'api_error' : 'registering'),
            'registered_at' => $allActive ? now() : null,
            'admin_notes' => $allActive ? 'Seluruh domain bundle berhasil didaftarkan.' : 'Sebagian domain bundle perlu pemeriksaan.',
        ]);

        if ($allActive) {
            Notification::route('mail', $order->client_email)->notify(new OrderActiveNotification($order->refresh()));
        } elseif ($hasErrors) {
            Notification::route('mail', $order->client_email)->notify(new DomainRegistrationFailedNotification($order->refresh()));
        }
    }

    public function register(Order $order): void
    {
        try {
            DB::transaction(function () use ($order) {
                $order->update(['status' => 'registering', 'liquid_error' => null]);

                $order->loadMissing(['domain', 'items.domain']);
                if ($order->items->isNotEmpty()) {
                    $this->registerItems($order);

                    return;
                }

                $domain = $order->domain;
                if (! $domain || ! $order->domain_name) {
                    $order->update(['status' => 'failed', 'liquid_error' => 'Data domain belum lengkap.']);

                    return;
                }

                $available = $this->liquid->available($order->domain_name, $domain->extension);
                if ($available === false) {
                    $order->update(['status' => 'refund_needed', 'liquid_error' => 'Domain sudah tidak tersedia saat approval.']);

                    return;
                }

                $user = User::query()->where('email', $order->client_email)->first();
                $customerId = $order->liquid_customer_id ?: $user?->liquid_customer_id ?: $this->liquid->signupCustomer($order);
                $contactId = $this->liquid->createContact($order, $customerId);
                $registered = $this->liquid->registerDomain($order, $customerId, $contactId);
                $details = $this->liquid->domainDetailsByName(strtolower($order->domain_name).$domain->extension);

                $user?->update(['liquid_customer_id' => $customerId]);

                $order->update([
                    'status' => 'active',
                    'liquid_customer_id' => $customerId,
                    'liquid_domain_id' => $details['domain_id'] ?? $registered['domain_id'] ?? $registered['id'] ?? null,
                    'registered_at' => now(),
                    'admin_notes' => 'Registrasi Liqu.id berhasil dikirim. Status provider: '.($details['order_status'] ?? 'menunggu proses').'. Domain menunggu proses/verifikasi provider.',
                ]);

                Notification::route('mail', $order->client_email)->notify(new OrderActiveNotification($order->refresh()));
            });
        } catch (Throwable $e) {
            $order->update([
                'status' => 'api_error',
                'liquid_error' => $e->getMessage(),
                'admin_notes' => 'Registrasi gagal. Tim ForDev perlu memeriksa pesanan ini.',
            ]);
            Notification::route('mail', $order->client_email)
                ->notify(new DomainRegistrationFailedNotification($order->refresh()));
        }
    }
}
