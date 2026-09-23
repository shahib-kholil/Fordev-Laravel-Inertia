<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Testing\AssertableInertia;
use Laravel\Socialite\Facades\Socialite;
use Tests\TestCase;

class AuditAccessTest extends TestCase
{
    use RefreshDatabase;

    public function createApplication()
    {
        // Isolate env/config/storage before Laravel bootstrap; never load repository secrets.
        $tmp = sys_get_temp_dir().'/fordev-access-audit-'.getmypid();
        foreach (['', '/framework/views', '/framework/sessions', '/framework/cache', '/logs'] as $directory) {
            if (! is_dir($tmp.$directory)) {
                mkdir($tmp.$directory, 0700, true);
            }
        }
        file_put_contents($tmp.'/audit-env', "APP_ENV=testing\n");
        foreach (['APP_CONFIG_CACHE', 'APP_ROUTES_CACHE', 'APP_EVENTS_CACHE'] as $key) {
            putenv($key.'='.$tmp.'/'.$key.'.php');
            $_ENV[$key] = $_SERVER[$key] = $tmp.'/'.$key.'.php';
        }
        $app = require dirname(__DIR__, 2).'/bootstrap/app.php';
        $app->useEnvironmentPath($tmp)->loadEnvironmentFrom('audit-env');
        $app->useStoragePath($tmp);
        $this->traitsUsedByTest = class_uses_recursive(static::class);
        $app->make(Kernel::class)->bootstrap();

        return $app;
    }

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.key' => 'base64:'.base64_encode(str_repeat('a', 32)), 'logging.default' => 'null']);
        $this->assertSame('sqlite', config('database.default'));
        $this->assertSame(':memory:', config('database.connections.sqlite.database'));
        Http::preventStrayRequests();
        Http::fake();
        Notification::fake();
        $this->withoutVite();
        Inertia::version('audit');
        $this->withHeader('X-Inertia-Version', 'audit');
    }

    public function test_admin_cannot_escalate_own_role(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $route = app('router')->getRoutes()->getByName('admin.users.update');
        $this->assertContains('super_admin', $route->gatherMiddleware());
        $this->actingAs($admin)->get('/admin/users')->assertForbidden();
        $this->put('/admin/users/'.$admin->id, ['role' => 'super_admin'])->assertForbidden();
        $this->assertSame('admin', $admin->refresh()->role);
    }

    public function test_super_admin_can_manage_roles(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);
        $user = User::factory()->create(['role' => 'user']);
        $this->actingAs($admin)->get('/admin/users')->assertOk();
        $this->put('/admin/users/'.$user->id, ['role' => 'admin'])->assertRedirect();
        $this->assertSame('admin', $user->refresh()->role);
        $this->put('/admin/users/'.$admin->id, ['role' => 'user'])->assertStatus(422);
        $this->assertSame('super_admin', $admin->refresh()->role);
    }

    public function test_unverified_admin_is_not_blocked_by_verified_middleware(): void
    {
        $admin = User::factory()->unverified()->create(['role' => 'admin']);
        $this->actingAs($admin)->get('/dashboard')->assertOk();
    }

    public function test_normal_user_cannot_access_admin_or_other_owners_payments(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $order = Order::factory()->create(['client_email' => 'other@example.test', 'status' => 'pending_payment']);
        $this->actingAs($user)->get('/admin/users')->assertForbidden();
        $this->post('/order/'.$order->order_number.'/payment', ['payment_method' => 'manual'])->assertNotFound();
        $this->post('/order/'.$order->order_number.'/payment/sync')->assertNotFound();
        Http::assertNothingSent();
    }

    public function test_guest_lookup_exposes_only_public_order_fields(): void
    {
        $order = Order::factory()->create([
            'client_email' => 'buyer@example.test',
            'admin_notes' => 'audit-private-note',
            'liquid_error' => 'audit-provider-diagnostic',
            'address_line_1' => 'audit-private-address',
        ]);
        $this->post('/cek-status-pesanan', [
            'order_number' => $order->order_number, 'client_email' => $order->client_email,
        ], ['X-Inertia' => 'true'])->assertOk()
            ->assertJsonPath('props.order.order_number', $order->order_number)
            ->assertJsonMissingPath('props.order.admin_notes')
            ->assertJsonMissingPath('props.order.liquid_error')
            ->assertJsonMissingPath('props.order.address_line_1');

        $owner = User::factory()->create(['email' => $order->client_email]);
        $this->actingAs($owner)->get('/cek-status-pesanan')->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('order.order_number', $order->order_number)
                ->missing('order.admin_notes')
                ->missing('order.liquid_error')
                ->missing('order.address_line_1')
                ->missing('orders.0.admin_notes'));
    }

    public function test_email_reassignment_claims_orders_of_deleted_customer(): void
    {
        $attacker = User::factory()->create(['role' => 'user']);
        $order = Order::factory()->create(['client_email' => 'deleted-buyer@example.test']);
        $this->actingAs($attacker)->patch('/settings/profile', [
            'name' => 'Audit Attacker', 'email' => $order->client_email,
        ])->assertSessionHasErrors('email');
        $this->assertSame($attacker->email, $attacker->refresh()->email);
        $this->get('/cek-status-pesanan')->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->where('orders', []));
    }

    public function test_google_callback_requires_existing_local_two_factor_challenge(): void
    {
        $user = User::factory()->create([
            'role' => 'admin', 'google_id' => 'audit-google-id',
            'two_factor_secret' => encrypt('AUDITFAKESECRET'),
            'two_factor_confirmed_at' => now(),
        ]);
        $google = new \Laravel\Socialite\Two\User;
        $google->map(['id' => 'audit-google-id', 'email' => $user->email, 'name' => 'Audit User']);
        Socialite::shouldReceive('driver')->with('google')->once()->andReturn(
            \Mockery::mock()->shouldReceive('user')->once()->andReturn($google)->getMock()
        );
        $this->get('/auth/google/callback')->assertRedirect(route('two-factor.login'));
        $this->assertGuest();
        $this->assertSame($user->id, session('login.id'));
    }

    public function test_webhook_rejects_missing_or_wrong_token_and_mode(): void
    {
        config(['services.borderpay.webhook_token' => 'audit-token', 'services.borderpay.api_key' => 'bp_test_audit']);
        $this->postJson('/webhooks/borderpay', [])->assertUnauthorized();
        $this->postJson('/webhooks/borderpay', [], ['x-borderpay-token' => 'wrong'])->assertUnauthorized();
        $this->postJson('/webhooks/borderpay', [], ['x-borderpay-token' => 'audit-token', 'x-borderpay-mode' => 'live'])->assertStatus(422);
        config(['services.borderpay.webhook_token' => '']);
        $this->postJson('/webhooks/borderpay', [])->assertUnauthorized();
        Http::assertNothingSent();
    }
}
