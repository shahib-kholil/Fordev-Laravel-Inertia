<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderPendingPaymentNotification extends Notification implements ShouldQueue
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
            ->subject('Instruksi pembayaran '.$this->order->order_number)
            ->line('Pesanan Anda sudah dikonfirmasi. Silakan lanjutkan pembayaran sesuai instruksi admin via WhatsApp.')
            ->line('Nomor order: '.$this->order->order_number)
            ->action('Cek Status Pesanan', url('/cek-status-pesanan'));
    }
}
