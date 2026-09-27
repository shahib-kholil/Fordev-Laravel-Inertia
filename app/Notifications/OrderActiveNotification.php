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
            ->line('Akses pengelola domain menggunakan email pembelian Anda sebagai nama pengguna.')
            ->line('Nama pengguna: '.$this->order->client_email)
            ->line('Jika belum memiliki password, pilih Forgot Password di halaman login provider untuk membuat password baru.')
            ->action('Login Pengelola Domain', config('services.liquid.panel_url', url('/cek-status-pesanan')))
            ->line('Order: '.$this->order->order_number);
    }
}
