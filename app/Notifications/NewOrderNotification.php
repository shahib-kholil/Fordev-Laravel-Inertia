<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewOrderNotification extends Notification
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
            ->subject('Order baru '.$this->order->order_number)
            ->line('Ada permintaan penawaran baru dari '.$this->order->client_name.'.')
            ->line('Email: '.$this->order->client_email)
            ->line('Tipe: '.$this->order->order_type)
            ->action('Lihat Order', url('/admin/orders/'.$this->order->id));
    }
}
