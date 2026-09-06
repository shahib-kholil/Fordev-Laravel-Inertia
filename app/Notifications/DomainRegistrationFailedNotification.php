<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DomainRegistrationFailedNotification extends Notification implements ShouldQueue
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
            ->subject('Pendaftaran domain memerlukan perhatian '.$this->order->order_number)
            ->line('Pendaftaran domain belum berhasil diselesaikan.')
            ->line('Domain: '.$this->order->domain_name.($this->order->domain?->extension ?? ''))
            ->line('Status: '.$this->order->status)
            ->line('Tim ForDev akan memeriksa pesanan Anda dan menghubungi Anda jika diperlukan.')
            ->action('Cek Status Pesanan', url('/cek-status-pesanan'));
    }
}
