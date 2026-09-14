<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['domain_id', 'code', 'type', 'value', 'starts_at', 'ends_at', 'max_uses', 'used_count', 'is_active'])]
class DomainCoupon extends Model
{
    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function domain(): BelongsTo
    {
        return $this->belongsTo(Domain::class);
    }

    public function finalPrice(int $price): int
    {
        return min($price, $this->value);
    }

    public function discount(int $price): int
    {
        return $price - $this->finalPrice($price);
    }

    public function usable(): bool
    {
        return $this->is_active
            && (! $this->starts_at || $this->starts_at->isPast())
            && (! $this->ends_at || $this->ends_at->isFuture())
            && (! $this->max_uses || $this->used_count < $this->max_uses);
    }
}
