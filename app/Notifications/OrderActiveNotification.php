<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderActiveNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly Order $order) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Domain aktif '.$this->order->order_number)
            ->line('Pesanan domain Anda sudah aktif.')
            ->line('Domain: '.$this->order->domain_name.($this->order->domain?->extension ?? ''))
            ->action('Cek Status Pesanan', url('/cek-status-pesanan'));
    }
}
