<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use App\Notifications\OrderActiveNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Throwable;

class LiquidDomainRegistrar
{
    public function __construct(private readonly LiquidDomainClient $liquid) {}

    public function register(Order $order): void
    {
        try {
            DB::transaction(function () use ($order) {
                $order->update(['status' => 'registering', 'liquid_error' => null]);

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
                    'admin_notes' => 'Registrasi Liqu.id: '.($details['order_status'] ?? 'berhasil dibuat').'. Domain menunggu proses/verifikasi provider.',
                ]);

                Notification::route('mail', $order->client_email)->notify(new OrderActiveNotification($order->refresh()));
            });
        } catch (Throwable $e) {
            $order->update(['status' => 'api_error', 'liquid_error' => $e->getMessage()]);
        }
    }
}
