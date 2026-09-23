import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function OrderShow({ order, statuses }) {
    const { data, setData, put, processing } = useForm({
        status: order.status,
        admin_notes: order.admin_notes ?? '',
        action: '',
    });
    function submit(e) {
        e.preventDefault();
        put(`/admin/orders/${order.id}`);
    }
    function approveRegister() {
        setData('action', 'approve_register');
        setTimeout(() => put(`/admin/orders/${order.id}`), 0);
    }
    const canRegister =
        ['paid', 'api_error', 'refund_needed'].includes(order.status) &&
        ['domain', 'both'].includes(order.order_type);
    const statusClass =
        {
            active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
            api_error:
                'border-destructive/30 bg-destructive/10 text-destructive',
            registering: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
            pending_confirmation:
                'border-blue-500/30 bg-blue-500/10 text-blue-400',
        }[order.status] ?? 'border-border bg-muted text-muted-foreground';

    return (
        <>
            <Head title={order.order_number} />
            <div className="max-w-3xl space-y-5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {order.order_number}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {order.client_name} · {order.client_email} ·{' '}
                            {order.client_phone}
                        </p>
                    </div>
                    <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusClass}`}
                    >
                        {order.status.replaceAll('_', ' ')}
                    </span>
                </div>
                <div className="rounded-xl border p-5 text-sm">
                    {order.items?.length > 0 && (
                        <div className="mb-4 space-y-2 border-b pb-4">
                            <p className="font-semibold">Domain dalam paket</p>
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex justify-between gap-3 rounded-lg border p-3"
                                >
                                    <span>
                                        {item.domain_name}
                                        {item.extension}
                                    </span>
                                    <span className="capitalize">
                                        {item.status.replaceAll('_', ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    <p>Status: {order.status}</p>
                    <p>Tipe: {order.order_type}</p>
                    <p>Paket: {order.web_service?.name ?? '-'}</p>
                    <p>
                        Harga paket snapshot:{' '}
                        {order.web_service_price_snapshot ?? '-'}
                    </p>
                    {(!order.items || order.items.length === 0) && (
                        <p>
                            Domain: {order.domain_name ?? '-'}{' '}
                            {order.domain?.extension ?? ''}
                        </p>
                    )}
                    <p>
                        Harga domain snapshot:{' '}
                        {order.domain_price_snapshot ?? '-'}
                    </p>
                    <p>
                        Diskon snapshot: {order.domain_discount_snapshot ?? 0}
                    </p>
                    <p>Privasi WHOIS: {order.whois_privacy_snapshot ?? 0}</p>
                    <p>Pajak: {order.tax_snapshot ?? 0}</p>
                    <p className="font-semibold">
                        Total snapshot: {order.total_snapshot ?? '-'}
                    </p>
                    <p>Liquid Customer ID: {order.liquid_customer_id ?? '-'}</p>
                    <p>Liquid Domain ID: {order.liquid_domain_id ?? '-'}</p>
                    <p>Paid at: {order.paid_at ?? '-'}</p>
                    <p>Registered at: {order.registered_at ?? '-'}</p>
                    <p className="text-destructive">
                        Liquid error: {order.liquid_error ?? '-'}
                    </p>
                    <p>Catatan klien: {order.notes ?? '-'}</p>
                </div>
                {order.payments?.length > 0 && (
                    <div className="space-y-3 rounded-xl border p-5 text-sm">
                        <p className="font-semibold">Payment BorderPay</p>
                        {order.payments.map((payment) => (
                            <div
                                key={payment.id}
                                className="space-y-2 rounded-lg border p-3"
                            >
                                <p>Reference: {payment.reference_id}</p>
                                <p>Status: {payment.status}</p>
                                <p>
                                    Nominal: Rp{' '}
                                    {Number(payment.amount).toLocaleString(
                                        'id-ID',
                                    )}
                                </p>
                                {payment.status === 'pending' && (
                                    <div className="flex flex-wrap gap-2">
                                        {payment.provider === 'borderpay' && (
                                            <NativeAction
                                                action={`/admin/orders/${order.id}/sync-payment`}
                                                label="Sync status"
                                            />
                                        )}
                                        {payment.provider === 'manual' && (
                                            <NativeAction
                                                action={`/admin/orders/${order.id}/verify-manual-payment`}
                                                label="Verifikasi manual"
                                            />
                                        )}
                                        {payment.provider === 'borderpay' && (
                                            <>
                                                <NativeAction
                                                    action={`/admin/orders/${order.id}/simulate-payment`}
                                                    label="Simulate test"
                                                />
                                                <NativeAction
                                                    action={`/admin/orders/${order.id}/cancel-payment`}
                                                    label="Cancel payment"
                                                />
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                <form
                    onSubmit={submit}
                    className="space-y-3 rounded-xl border p-5"
                >
                    <select
                        className="h-9 w-full rounded-lg border bg-background px-2 text-sm"
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value)}
                    >
                        {statuses.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                    <textarea
                        className="min-h-28 w-full rounded-lg border bg-transparent p-2 text-sm"
                        value={data.admin_notes}
                        onChange={(e) => setData('admin_notes', e.target.value)}
                        placeholder="Catatan admin"
                    />
                    {processing && (
                        <div
                            className="h-2 w-full animate-pulse rounded bg-muted"
                            aria-label="Memproses"
                        />
                    )}
                    <div className="flex flex-wrap gap-2">
                        <Button disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Update'}
                        </Button>
                        {order.status === 'pending_confirmation' && (
                            <Button
                                type="button"
                                variant="outline"
                                disabled={processing}
                                onClick={() => {
                                    setData('status', 'paid');
                                    setTimeout(
                                        () => put(`/admin/orders/${order.id}`),
                                        0,
                                    );
                                }}
                            >
                                Konfirmasi Pembayaran
                            </Button>
                        )}
                        {canRegister && (
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={processing}
                                onClick={approveRegister}
                            >
                                Approve & Register
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href="/admin/orders">Kembali</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

function NativeAction({ action, label }) {
    return (
        <form method="post" action={action}>
            <input
                type="hidden"
                name="_token"
                value={
                    document.querySelector('meta[name="csrf-token"]')
                        ?.content ?? ''
                }
            />
            <button
                type="submit"
                className="rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-muted"
            >
                {label}
            </button>
        </form>
    );
}

OrderShow.layout = {
    breadcrumbs: [{ title: 'Orders', href: '/admin/orders' }],
};
