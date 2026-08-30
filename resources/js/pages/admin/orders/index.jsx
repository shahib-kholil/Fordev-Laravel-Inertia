import { Head, Link, router } from '@inertiajs/react';
import { AdminPageShell } from '@/components/admin/page-shell';
import { AdminTable, AdminTableCard } from '@/components/admin/table-card';
import AdminSearch from '@/components/admin-search';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';

export default function OrdersIndex({ orders, filters, statuses }) {
    const toolbar = (
        <div className="flex flex-col gap-3 sm:flex-row">
            <AdminSearch
                action="/admin/orders"
                defaultValue={filters.q}
                placeholder="Cari order/email..."
            />
            <select
                className="h-9 rounded-lg border bg-background px-2 text-sm"
                value={filters.status ?? ''}
                onChange={(e) =>
                    router.get(
                        '/admin/orders',
                        { status: e.target.value },
                        { preserveState: true },
                    )
                }
            >
                <option value="">Semua status</option>
                {statuses.map((status) => (
                    <option key={status} value={status}>
                        {status}
                    </option>
                ))}
            </select>
        </div>
    );

    return (
        <>
            <Head title="Orders" />
            <AdminPageShell
                title="Orders"
                description="Kelola permintaan penawaran masuk."
            >
                <AdminTableCard
                    toolbar={toolbar}
                    pagination={<Pagination links={orders.links} />}
                >
                    <AdminTable>
                        <thead className="bg-muted/60 text-left">
                            <tr>
                                <th className="p-3">Nomor</th>
                                <th className="p-3">Klien</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.data.map((order) => (
                                <tr key={order.id} className="border-t">
                                    <td className="p-3 font-medium">
                                        {order.order_number}
                                    </td>
                                    <td className="p-3">
                                        <div>{order.client_name}</div>
                                        <div className="text-muted-foreground">
                                            {order.client_email}
                                        </div>
                                    </td>
                                    <td className="p-3">{order.status}</td>
                                    <td className="p-3 text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                            >
                                                Detail
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </AdminTable>
                </AdminTableCard>
            </AdminPageShell>
        </>
    );
}
OrdersIndex.layout = {
    breadcrumbs: [{ title: 'Orders', href: '/admin/orders' }],
};
