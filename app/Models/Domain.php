<?php

namespace App\Models;

use Database\Factories\DomainFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['extension', 'order_position', 'price', 'promo_price', 'renewal_price', 'transfer_price', 'badge', 'is_available'])]
class Domain extends Model
{
    /** @use HasFactory<DomainFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return ['is_available' => 'boolean'];
    }

    public function coupons(): HasMany
    {
        return $this->hasMany(DomainCoupon::class);
    }
}
