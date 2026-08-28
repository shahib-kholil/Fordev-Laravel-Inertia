<?php

namespace Tests\Feature;

use App\Models\Domain;
use App\Models\Order;
use App\Models\User;
use App\Models\WebService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class FordevFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_pages_are_reachable(): void
    {
        $this->get('/')->assertOk();
        $this->get('/jasa-web')->assertOk();
        $this->get('/domain')->assertOk();
        $this->get('/portofolio')->assertOk();
        $this->get('/order')->assertOk();
        $this->get('/cek-status-pesanan')->assertOk();
    }

    public function test_order_submission_creates_price_snapshots(): void
    {
        Notification::fake();

        $webService = WebService::factory()->create(['price' => 2500000]);
        $domain = Domain::factory()->create(['price' => 185000]);

        $this->post('/order', [
            'client_name' => 'Budi',
            'client_email' => 'budi@example.com',
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
        ]);
    }

    public function test_admin_pages_are_reachable(): void
    {
        $this->actingAs(User::factory()->create());

        $this->get('/admin/dashboard')->assertOk();
        $this->get('/admin/web-services')->assertOk();
        $this->get('/admin/domains')->assertOk();
        $this->get('/admin/portfolios')->assertOk();
        $this->get('/admin/testimonials')->assertOk();
        $this->get('/admin/settings')->assertOk();
        $this->get('/admin/orders')->assertOk();
    }
}
