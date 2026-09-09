<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['order_id', 'domain_id', 'domain_name', 'extension', 'price_snapshot', 'discount_snapshot', 'tax_snapshot', 'status', 'liquid_domain_id', 'liquid_error', 'registered_at'])]
class OrderItem extends Model
{
    protected function casts(): array
    {
        return ['registered_at' => 'datetime'];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function domain(): BelongsTo
    {
        return $this->belongsTo(Domain::class);
    }
}
