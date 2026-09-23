<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['order_id', 'provider', 'reference_id', 'provider_payment_id', 'method', 'status', 'amount', 'fee', 'customer_pays', 'merchant_receives', 'fee_borne_by', 'checkout_url', 'qr_string', 'va_number', 'va_bank', 'expires_at', 'paid_at', 'provider_payload'])]
class Payment extends Model
{
    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'fee' => 'integer',
            'customer_pays' => 'integer',
            'merchant_receives' => 'integer',
            'expires_at' => 'datetime',
            'paid_at' => 'datetime',
            'provider_payload' => 'array',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
