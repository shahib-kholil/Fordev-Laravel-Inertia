import { Head } from '@inertiajs/react';

const labels = {
    pending: 'Pending',
    processing: 'Diproses',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

export default function Dashboard({ stats }) {
    const orders = stats.ordersByStatus ?? {};

    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Dashboard Admin</h1>
                    <p className="text-sm text-muted-foreground">Ringkasan pesanan, paket, domain, dan portofolio.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard title="Paket aktif" value={stats.activeWebServices} />
                    <StatCard title="Domain tersedia" value={stats.availableDomains} />
                    <StatCard title="Portofolio" value={stats.portfolios} />
                </div>

                <section className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
                    <h2 className="mb-4 text-lg font-medium">Pesanan per status</h2>
                    <div className="grid gap-3 md:grid-cols-4">
                        {Object.entries(labels).map(([status, label]) => (
                            <StatCard key={status} title={label} value={orders[status] ?? 0} compact />
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}

function StatCard({ title, value, compact = false }) {
    return (
        <div className="rounded-xl border bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={compact ? 'mt-2 text-2xl font-semibold' : 'mt-3 text-3xl font-semibold'}>{value}</p>
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Admin',
            href: '/admin/dashboard',
        },
    ],
};
