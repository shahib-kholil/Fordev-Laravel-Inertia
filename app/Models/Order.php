<?php

namespace App\Models;

use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['order_number', 'client_name', 'client_email', 'client_phone', 'order_type', 'web_service_id', 'web_service_price_snapshot', 'domain_id', 'domain_name', 'domain_price_snapshot', 'liquid_customer_id', 'liquid_domain_id', 'liquid_error', 'paid_at', 'registered_at', 'status', 'notes', 'admin_notes'])]
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return ['paid_at' => 'datetime', 'registered_at' => 'datetime'];
    }

    public function webService(): BelongsTo
    {
        return $this->belongsTo(WebService::class);
    }

    public function domain(): BelongsTo
    {
        return $this->belongsTo(Domain::class);
    }
}
