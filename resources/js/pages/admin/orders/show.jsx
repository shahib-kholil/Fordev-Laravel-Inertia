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
    return (
        <>
            <Head title={order.order_number} />
            <div className="max-w-3xl space-y-5 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">
                        {order.order_number}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {order.client_name} · {order.client_email} ·{' '}
                        {order.client_phone}
                    </p>
                </div>
                <div className="rounded-xl border p-5 text-sm">
                    <p>Status: {order.status}</p>
                    <p>Tipe: {order.order_type}</p>
                    <p>Paket: {order.web_service?.name ?? '-'}</p>
                    <p>
                        Harga paket snapshot:{' '}
                        {order.web_service_price_snapshot ?? '-'}
                    </p>
                    <p>
                        Domain: {order.domain_name ?? '-'}{' '}
                        {order.domain?.extension ?? ''}
                    </p>
                    <p>
                        Harga domain snapshot:{' '}
                        {order.domain_price_snapshot ?? '-'}
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
                    <div className="flex flex-wrap gap-2">
                        <Button disabled={processing}>Update</Button>
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
OrderShow.layout = {
    breadcrumbs: [{ title: 'Orders', href: '/admin/orders' }],
};
