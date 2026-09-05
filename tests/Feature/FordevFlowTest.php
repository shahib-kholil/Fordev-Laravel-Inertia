<?php

namespace Tests\Feature;

use App\Models\Domain;
use App\Models\Order;
use App\Models\User;
use App\Models\WebService;
use App\Notifications\OrderActiveNotification;
use App\Notifications\OrderPendingPaymentNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class FordevFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_liquid_phone_formats_are_normalized_to_twelve_local_digits(): void
    {
        config(['services.liquid.reseller_id' => 'demo', 'services.liquid.api_key' => 'secret']);
        Http::fake([
            '*customers?email=*' => Http::response([]),
            '*customers' => Http::response(['customer_id' => 'cus_1']),
        ]);
        $order = Order::factory()->make(['client_phone' => '+62 81234567890']);

        app(\App\Services\LiquidDomainClient::class)->signupCustomer($order);

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

        $details = app(\App\Services\LiquidDomainClient::class)->domainDetailsByName('TOKOKU.COM');

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

        $prices = app(\App\Services\LiquidDomainClient::class)->prices();

        $this->assertSame(['com' => ['register' => 100000]], $prices);
    }

    public function test_public_pages_are_reachable(): void
    {
        $this->get('/')->assertOk();
        $this->get('/jasa-web')->assertOk();
        $this->get('/domain')->assertOk();
        $this->get('/portofolio')->assertOk();
        $this->get('/order')->assertRedirect('/login');
        $this->get('/cek-status-pesanan')->assertOk();
    }

    public function test_order_submission_creates_price_snapshots(): void
    {
        Http::fake(['*' => Http::response(['available' => true])]);
        Notification::fake();

        $webService = WebService::factory()->create(['price' => 2500000]);
        $domain = Domain::factory()->create(['price' => 185000]);
        $this->actingAs(User::factory()->create(['name' => 'Budi', 'email' => 'budi@example.com']));

        $this->post('/order', [
            'client_phone' => '08123456789',
            'order_type' => 'both',
            'web_service_id' => $webService->id,
            'domain_id' => $domain->id,
            'domain_name' => 'tokoku',
        ])->assertRedirect('/cek-status-pesanan');

        $this->assertDatabaseHas(Order::class, [
            'client_email' => 'budi@example.com',
            'web_service_price_snapshot' => 2500000,
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
        ])->assertRedirect('/cek-status-pesanan');

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

    public function test_registration_route_is_disabled(): void
    {
        $this->get('/register')->assertNotFound();
    }
}
