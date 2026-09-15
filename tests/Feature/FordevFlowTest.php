<?php

namespace Tests\Feature;

use App\Models\Domain;
use App\Models\DomainCoupon;
use App\Models\Order;
use App\Models\Setting;
use App\Models\User;
use App\Notifications\OrderActiveNotification;
use App\Notifications\OrderPendingPaymentNotification;
use App\Services\LiquidDomainClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class FordevFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.turnstile.site_key' => null, 'services.turnstile.secret_key' => null]);
    }

    public function test_liquid_phone_formats_are_normalized_to_twelve_local_digits(): void
    {
        config(['services.liquid.reseller_id' => 'demo', 'services.liquid.api_key' => 'secret']);
        Http::fake([
            '*customers?email=*' => Http::response([]),
            '*customers' => Http::response(['customer_id' => 'cus_1']),
        ]);
        $order = Order::factory()->make(['client_phone' => '+62 81234567890']);

        app(LiquidDomainClient::class)->signupCustomer($order);

        Http::assertSent(fn ($request) => $request->url() === config('services.liquid.base_url').'/customers' && $request['tel_cc_no'] === '62' && $request['tel_no'] === '081234567890');
    }

    public function test_domain_details_by_name_are_returned_as_array(): void
    {
        config([
            'services.liquid.reseller_id' => 'demo',
            'services.liquid.api_key' => 'secret',
        ]);
        Http::fake([
            '*domains/details-by-name*' => Http::response(['domain_name' => 'tokoku.com', 'status' => 'active']),
        ]);

        $details = app(LiquidDomainClient::class)->domainDetailsByName('TOKOKU.COM');

        $this->assertSame(['domain_name' => 'tokoku.com', 'status' => 'active'], $details);
    }

    public function test_liquid_prices_are_returned_as_array(): void
    {
        config([
            'services.liquid.reseller_id' => 'demo',
            'services.liquid.api_key' => 'secret',
        ]);
        Http::fake([
            '*account/prices' => Http::response(['com' => ['register' => 100000]]),
        ]);

        $prices = app(LiquidDomainClient::class)->prices();

        $this->assertSame(['com' => ['register' => 100000]], $prices);
    }

    public function test_public_pages_are_reachable(): void
    {
        $this->get('/')->assertOk();
        $this->get('/jasa-web')->assertOk();
        $this->get('/domain')->assertOk();
        $this->get('/portofolio')->assertOk();
        $this->get('/order')->assertRedirect('/login?login_notice=domain');
        $this->get('/cek-status-pesanan')->assertOk();
    }

    public function test_order_submission_creates_price_snapshots(): void
    {
        Http::fake(['*' => Http::response(['available' => true])]);
        Notification::fake();

        $domain = Domain::factory()->create(['price' => 185000]);
        $this->actingAs(User::factory()->create(['name' => 'Budi', 'email' => 'budi@example.com']));

        $this->post('/order', [
            'client_phone' => '08123456789',
            'order_type' => 'domain',
            'domain_id' => $domain->id,
            'domain_name' => 'tokoku',
            'address_line_1' => 'Jl. Merdeka No. 1',
            'city' => 'Jakarta',
            'state' => 'DKI Jakarta',
            'zipcode' => '10110',
            'country_code' => 'ID',
        ])->assertRedirectContains('/cek-status-pesanan?order=');

        $this->assertDatabaseHas(Order::class, [
            'client_email' => 'budi@example.com',
            'domain_price_snapshot' => 185000,
            'status' => 'pending_confirmation',
        ]);
    }

    public function test_domain_order_rejects_unavailable_liquid_domain(): void
    {
        config([
            'services.liquid.reseller_id' => 'demo',
            'services.liquid.api_key' => 'secret',
        ]);

        Http::fake([
            '*domains/availability*' => Http::response([['tokoku.com' => ['status' => 'unavailable']]]),
        ]);

        $domain = Domain::factory()->create(['extension' => '.com']);

        $this->from('/order')->actingAs(User::factory()->create(['email' => 'budi@example.com']))->post('/order', [
            'client_phone' => '08123456789',
            'order_type' => 'domain',
            'domain_id' => $domain->id,
            'domain_name' => 'tokoku',
            'address_line_1' => 'Jl. Merdeka No. 1',
            'city' => 'Jakarta',
            'state' => 'DKI Jakarta',
            'zipcode' => '10110',
            'country_code' => 'ID',
        ])->assertRedirect('/order')->assertSessionHasErrors('domain_name');

        $this->assertDatabaseMissing(Order::class, ['client_email' => 'budi@example.com']);
    }

    public function test_domain_order_continues_when_liquid_domain_is_available(): void
    {
        config([
            'services.liquid.reseller_id' => 'demo',
            'services.liquid.api_key' => 'secret',
        ]);

        Http::fake([
            '*domains/availability*' => Http::response([['tokoku.id' => ['status' => 'available']]]),
        ]);
        Notification::fake();

        $domain = Domain::factory()->create(['extension' => '.id', 'price' => 250000]);

        $this->actingAs(User::factory()->create(['name' => 'Siti', 'email' => 'siti@example.com']))->post('/order', [
            'client_phone' => '08123456789',
            'order_type' => 'domain',
            'domain_id' => $domain->id,
            'domain_name' => 'tokoku',
            'address_line_1' => 'Jl. Merdeka No. 1',
            'city' => 'Jakarta',
            'state' => 'DKI Jakarta',
            'zipcode' => '10110',
            'country_code' => 'ID',
        ])->assertRedirectContains('/cek-status-pesanan?order=');

        $this->assertDatabaseHas(Order::class, [
            'client_email' => 'siti@example.com',
            'domain_name' => 'tokoku',
            'domain_price_snapshot' => 250000,
        ]);
    }

    public function test_public_domain_check_shows_available_result(): void
    {
        Cache::put('domain-check:tokoku.com', [
            'domain' => 'tokoku.com',
            'available' => true,
            'status' => 'available',
        ]);
        Domain::factory()->create(['extension' => '.com']);

        $this->get('/domain?name=tokoku&extension=.com')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('check.domain', 'tokoku.com')
                ->where('check.status', 'available'));
    }

    public function test_admin_can_approve_and_register_paid_domain_order(): void
    {
        config([
            'services.liquid.reseller_id' => 'demo',
            'services.liquid.api_key' => 'secret',
        ]);
        Http::fakeSequence()->push([['tokoku.com' => ['status' => 'available']]])->push([])->push(['customer_id' => 'CUST-1'])->push(['contact_id' => 'CONT-1'])->push(['domain_id' => 'DOM-1'])->push(['domain_id' => 'DOM-1', 'order_status' => 'pending']);

        $this->actingAs(User::factory()->create(['role' => 'super_admin']));
        $domain = Domain::factory()->create(['extension' => '.com']);
        $order = Order::factory()->create(['order_type' => 'domain', 'domain_id' => $domain->id, 'domain_name' => 'tokoku', 'status' => 'paid']);

        $this->put("/admin/orders/{$order->id}", ['status' => 'paid', 'admin_notes' => null, 'action' => 'approve_register'])->assertRedirect();

        $this->assertDatabaseHas(Order::class, ['id' => $order->id, 'status' => 'active', 'liquid_customer_id' => 'CUST-1', 'liquid_domain_id' => 'DOM-1']);
        Http::assertSent(fn ($request) => str_ends_with($request->url(), '/domains')
            && $request['invoice_option'] === 'no_invoice'
            && $request['registrant_contact_id'] === 'CONT-1');
    }

    public function test_admin_register_reuses_user_liquid_customer_id(): void
    {
        config([
            'services.liquid.reseller_id' => 'demo',
            'services.liquid.api_key' => 'secret',
        ]);
        Http::fakeSequence()->push([['tokoku.com' => ['status' => 'available']]])->push(['contact_id' => 'CONT-2'])->push(['domain_id' => 'DOM-2'])->push(['domain_id' => 'DOM-2', 'order_status' => 'pending']);
        Notification::fake();

        $user = User::factory()->create(['role' => 'super_admin', 'email' => 'siti@example.com', 'liquid_customer_id' => 'CUST-OLD']);
        $this->actingAs($user);
        $domain = Domain::factory()->create(['extension' => '.com']);
        $order = Order::factory()->create(['client_email' => 'siti@example.com', 'order_type' => 'domain', 'domain_id' => $domain->id, 'domain_name' => 'tokoku', 'status' => 'paid']);

        $this->put("/admin/orders/{$order->id}", ['status' => 'paid', 'admin_notes' => null, 'action' => 'approve_register'])->assertRedirect();

        $this->assertDatabaseHas(Order::class, ['id' => $order->id, 'status' => 'active', 'liquid_customer_id' => 'CUST-OLD']);
        Notification::assertSentOnDemand(OrderActiveNotification::class);
    }

    public function test_pending_payment_status_queues_customer_notification(): void
    {
        Notification::fake();

        $this->actingAs(User::factory()->create(['role' => 'super_admin']));
        $order = Order::factory()->create(['status' => 'pending_confirmation']);

        $this->put("/admin/orders/{$order->id}", ['status' => 'pending_payment', 'admin_notes' => null])->assertRedirect();

        Notification::assertSentOnDemand(OrderPendingPaymentNotification::class);
    }

    public function test_admin_can_reorder_domains(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'super_admin']));
        $first = Domain::factory()->create(['order_position' => 1]);
        $second = Domain::factory()->create(['order_position' => 2]);

        $this->put('/admin/domains/reorder', ['ids' => [$second->id, $first->id]])->assertRedirect();

        $this->assertDatabaseHas(Domain::class, ['id' => $second->id, 'order_position' => 1]);
        $this->assertDatabaseHas(Domain::class, ['id' => $first->id, 'order_position' => 2]);
    }

    public function test_admin_approve_marks_refund_needed_when_domain_is_taken(): void
    {
        config([
            'services.liquid.reseller_id' => 'demo',
            'services.liquid.api_key' => 'secret',
        ]);
        Http::fake(['*domains/availability*' => Http::response([['tokoku.com' => ['status' => 'unavailable']]])]);

        $this->actingAs(User::factory()->create(['role' => 'super_admin']));
        $domain = Domain::factory()->create(['extension' => '.com']);
        $order = Order::factory()->create(['order_type' => 'domain', 'domain_id' => $domain->id, 'domain_name' => 'tokoku', 'status' => 'paid']);

        $this->put("/admin/orders/{$order->id}", ['status' => 'paid', 'admin_notes' => null, 'action' => 'approve_register'])->assertRedirect();

        $this->assertDatabaseHas(Order::class, ['id' => $order->id, 'status' => 'refund_needed']);
    }

    public function test_admin_approve_marks_api_error_when_liquid_fails(): void
    {
        config([
            'services.liquid.reseller_id' => 'demo',
            'services.liquid.api_key' => 'secret',
        ]);
        Http::fakeSequence()->push([['tokoku.com' => ['status' => 'available']]])->push(['message' => 'saldo kurang'], 402);

        $this->actingAs(User::factory()->create(['role' => 'super_admin']));
        $domain = Domain::factory()->create(['extension' => '.com']);
        $order = Order::factory()->create(['order_type' => 'domain', 'domain_id' => $domain->id, 'domain_name' => 'tokoku', 'status' => 'paid']);

        $this->put("/admin/orders/{$order->id}", ['status' => 'paid', 'admin_notes' => null, 'action' => 'approve_register'])->assertRedirect();

        $this->assertDatabaseHas(Order::class, ['id' => $order->id, 'status' => 'api_error']);
    }

    public function test_admin_pages_are_reachable(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'super_admin']));

        $this->get('/admin/dashboard')->assertOk();
        $this->get('/admin/web-services')->assertOk();
        $this->get('/admin/domains')->assertOk();
        $this->get('/admin/portfolios')->assertOk();
        $this->get('/admin/testimonials')->assertOk();
        $this->get('/admin/settings')->assertOk();
        $this->get('/admin/orders')->assertOk();
    }

    public function test_regular_user_cannot_open_admin_pages(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'user']));

        $this->get('/admin/dashboard')->assertForbidden();
    }

    public function test_pending_order_edit_keeps_coupon_price_and_updates_same_row(): void
    {
        Http::fake(['*' => Http::response(['available' => true])]);
        Notification::fake();
        $domain = Domain::factory()->create(['price' => 185000]);
        $coupon = DomainCoupon::create(['domain_id' => $domain->id, 'code' => 'HEMAT', 'type' => 'fixed', 'value' => 50000, 'is_active' => true]);
        $user = User::factory()->create(['email' => 'edit@example.com']);
        $payload = ['client_phone' => '08123456789', 'order_type' => 'domain', 'domain_id' => $domain->id, 'domain_name' => 'tokoku', 'address_line_1' => 'Jl. Merdeka No. 1', 'city' => 'Jakarta', 'state' => 'DKI Jakarta', 'zipcode' => '10110', 'country_code' => 'ID', 'coupon_code' => 'HEMAT'];
        $this->actingAs($user)->post('/order', $payload)->assertRedirect();
        $order = Order::query()->where('client_email', $user->email)->sole();
        $this->actingAs($user)->post('/order', [...$payload, 'client_phone' => '08123456780', 'coupon_code' => '', 'order_number' => $order->order_number])->assertRedirectContains($order->order_number);
        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'client_phone' => '08123456780', 'domain_price_snapshot' => 50000, 'domain_discount_snapshot' => 135000, 'coupon_code_snapshot' => $coupon->code]);
    }

    public function test_bundle_coupon_creates_primary_order_and_bundle_items(): void
    {
        Http::fake(['*domains/availability*' => Http::response([['tokoku.com' => ['status' => 'available']]])]);
        Notification::fake();
        $domains = Domain::factory()->count(2)->sequence(['extension' => '.com'], ['extension' => '.id'])->create();
        $bundleId = 'bundle-test';
        Setting::create(['key' => 'domain_bundles', 'value' => json_encode([['id' => $bundleId, 'name' => 'Starter', 'domain_ids' => $domains->pluck('id')->all(), 'price' => 150000, 'is_active' => true]])]);
        $coupon = DomainCoupon::create(['bundle_id' => $bundleId, 'code' => 'BUNDLE100', 'type' => 'fixed', 'value' => 100000, 'is_active' => true]);
        $user = User::factory()->create(['email' => 'bundle@example.com']);

        $this->actingAs($user)->post('/order', [
            'client_phone' => '08123456789', 'order_type' => 'domain', 'domain_id' => $domains[0]->id,
            'bundle_id' => $bundleId, 'domain_name' => 'tokoku', 'coupon_code' => $coupon->code,
            'address_line_1' => 'Jl. Merdeka No. 1', 'city' => 'Jakarta', 'state' => 'DKI Jakarta', 'zipcode' => '10110', 'country_code' => 'ID',
        ])->assertRedirectContains('/cek-status-pesanan?order=');

        $order = Order::query()->where('client_email', $user->email)->firstOrFail();
        $this->assertSame(100000, $order->domain_price_snapshot);
        $this->assertSame($bundleId, $order->bundle_id);
        $this->assertSame(50000, $order->bundle_discount_snapshot);
        $this->assertCount(2, $order->items);
    }

    public function test_bundle_order_edit_is_rejected(): void
    {
        $user = User::factory()->create(['email' => 'bundle-edit@example.com']);
        $order = Order::factory()->create(['client_email' => $user->email, 'bundle_id' => 'bundle-test', 'status' => 'pending_confirmation']);

        $this->actingAs($user)->get('/order?edit='.$order->order_number)
            ->assertInertia(fn ($page) => $page->where('defaults.edit_error', 'Pesanan bundling tidak dapat diedit. Buat pesanan baru jika ingin mengubah pilihannya.'));
    }

    public function test_bundle_registration_only_sends_primary_domain_to_liquid(): void
    {
        config(['services.liquid.reseller_id' => 'demo', 'services.liquid.api_key' => 'secret']);
        Http::fake(function ($request) {
            return match (true) {
                str_ends_with($request->url(), '/domains/availability') => Http::response([['tokoku.com' => ['status' => 'available']]]),
                str_ends_with($request->url(), '/customers') && $request->method() === 'GET' => Http::response([]),
                str_ends_with($request->url(), '/customers') => Http::response(['customer_id' => 'CUST-BUNDLE']),
                str_contains($request->url(), '/contacts') => Http::response(['contact_id' => 'CONT-BUNDLE']),
                str_ends_with($request->url(), '/domains') => Http::response(['domain_id' => 'DOM-MAIN']),
                str_contains($request->url(), '/domains/details-by-name') => Http::response(['domain_id' => 'DOM-MAIN', 'order_status' => 'pending']),
                default => Http::response([]),
            };
        });
        Notification::fake();
        $user = User::factory()->create(['email' => 'bundle-register@example.com']);
        $order = Order::factory()->create([
            'client_email' => $user->email,
            'order_type' => 'domain',
            'bundle_id' => 'bundle-test',
            'status' => 'paid',
        ]);
        $order->items()->createMany([
            ['domain_name' => 'tokoku', 'extension' => '.com', 'price_snapshot' => 150000, 'status' => 'pending_confirmation'],
            ['domain_name' => 'tokoku', 'extension' => '.id', 'price_snapshot' => 0, 'status' => 'pending_confirmation'],
        ]);

        $this->actingAs(User::factory()->create(['role' => 'super_admin']))
            ->put("/admin/orders/{$order->id}", ['status' => 'paid', 'action' => 'approve_register'])
            ->assertRedirect();

        Http::assertSentCount(6);
        $this->assertDatabaseHas('order_items', ['order_id' => $order->id, 'extension' => '.com', 'status' => 'active']);
        $this->assertDatabaseHas('order_items', ['order_id' => $order->id, 'extension' => '.id', 'status' => 'pending_confirmation']);
    }

    public function test_bundle_coupon_is_rejected_for_another_bundle_and_not_exposed_to_inertia(): void
    {
        $domains = Domain::factory()->count(4)->create();
        Setting::create(['key' => 'domain_bundles', 'value' => json_encode([
            ['id' => 'bundle-a', 'domain_ids' => [$domains[0]->id, $domains[1]->id], 'price' => 150000, 'is_active' => true],
            ['id' => 'bundle-b', 'domain_ids' => [$domains[2]->id, $domains[3]->id], 'price' => 180000, 'is_active' => true],
        ])]);
        DomainCoupon::create(['bundle_id' => 'bundle-a', 'code' => 'RAHASIA', 'type' => 'fixed', 'value' => 100000, 'is_active' => true]);
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/order/coupon', [
            'domain_id' => $domains[2]->id,
            'bundle_id' => 'bundle-b',
            'coupon_code' => 'RAHASIA',
        ])->assertUnprocessable();

        $this->actingAs($user)->get('/order?type=domain&bundle_id=bundle-a')
            ->assertInertia(fn ($page) => $page->missing('coupons'));
    }

    public function test_inactive_bundle_coupon_is_rejected(): void
    {
        $domains = Domain::factory()->count(2)->create();
        Setting::create(['key' => 'domain_bundles', 'value' => json_encode([
            ['id' => 'bundle-off', 'domain_ids' => $domains->pluck('id')->all(), 'price' => 150000, 'is_active' => false],
        ])]);
        DomainCoupon::create(['bundle_id' => 'bundle-off', 'code' => 'OFF', 'type' => 'fixed', 'value' => 100000, 'is_active' => true]);

        $this->actingAs(User::factory()->create())->postJson('/order/coupon', [
            'domain_id' => $domains[0]->id,
            'bundle_id' => 'bundle-off',
            'coupon_code' => 'OFF',
        ])->assertUnprocessable();
    }

    public function test_registration_route_is_disabled(): void
    {
        $this->get('/register')->assertNotFound();
    }
}
