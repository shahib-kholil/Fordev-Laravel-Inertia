<?php

namespace Tests\Unit;

use App\Models\DomainCoupon;
use PHPUnit\Framework\TestCase;

class DomainCouponTest extends TestCase
{
    public function test_coupon_value_is_the_final_domain_price(): void
    {
        $coupon = new DomainCoupon(['value' => 50000]);

        $this->assertSame(159900, $coupon->discount(209900));
        $this->assertSame(50000, $coupon->finalPrice(209900));
        $this->assertSame(50000, $coupon->finalPrice(50000));
    }
}
