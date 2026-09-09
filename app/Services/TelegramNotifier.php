<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Throwable;

class TelegramNotifier
{
    public function orderCreated(Order $order): void
    {
        $token = config('services.telegram.bot_token');
        $chatId = config('services.telegram.chat_id');

        if (! $token || ! $chatId) {
            return;
        }

        $order->loadMissing('items');
        $domains = $order->items->isNotEmpty()
            ? $order->items->map(fn ($item) => $item->domain_name.$item->extension)->join(', ')
            : ($order->domain_name ? $order->domain_name.($order->domain?->extension ?? '') : '-');
        $whatsappNumber = preg_replace('/\D+/', '', (string) $order->client_phone);
        $whatsappNumber = str_starts_with($whatsappNumber, '0')
            ? '62'.substr($whatsappNumber, 1)
            : $whatsappNumber;
        $message = "🔔 Order baru\n"
            ."Nomor: {$order->order_number}\n"
            ."Klien: {$order->client_name}\n"
            ."Email: {$order->client_email}\n"
            ."WhatsApp: {$order->client_phone}\n"
            ."Chat langsung: https://wa.me/{$whatsappNumber}\n"
            ."Domain: {$domains}\n"
            .'Total: Rp '.number_format((int) ($order->total_snapshot ?? 0), 0, ',', '.');

        try {
            Http::timeout(5)->post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $message,
            ])->throw();
        } catch (Throwable $e) {
            report($e);
        }
    }
}
