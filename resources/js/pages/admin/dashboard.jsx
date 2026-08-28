import { Head } from '@inertiajs/react';
import { CircleDollarSign, FolderKanban, Globe2, PackageCheck } from 'lucide-react';
import { AdminPageShell } from '@/components/admin/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const labels = {
    pending: 'Pending',
    processing: 'Diproses',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

const icons = [PackageCheck, Globe2, FolderKanban];

export default function Dashboard({ stats }) {
    const orders = stats.ordersByStatus ?? {};
    const cards = [
        ['Paket aktif', stats.activeWebServices, 'Paket jasa yang tampil ke publik'],
        ['Domain tersedia', stats.availableDomains, 'Ekstensi domain siap dipesan'],
        ['Portofolio', stats.portfolios, 'Karya yang ditampilkan'],
    ];

    return (
        <>
            <Head title="Admin Dashboard" />
            <AdminPageShell title="Dashboard Admin" description="Ringkasan performa katalog dan pesanan ForDev.">
                <div className="grid gap-4 md:grid-cols-3">
                    {cards.map(([title, value, description], index) => {
                        const Icon = icons[index];

                        return <StatCard key={title} title={title} value={value} description={description} icon={Icon} />;
                    })}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Pesanan per status</CardTitle>
                        <CardDescription>Pantau alur pesanan dari masuk sampai selesai.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-4">
                        {Object.entries(labels).map(([status, label]) => (
                            <StatCard key={status} title={label} value={orders[status] ?? 0} icon={CircleDollarSign} compact />
                        ))}
                    </CardContent>
                </Card>
            </AdminPageShell>
        </>
    );
}

function StatCard({ title, value, description, icon: Icon, compact = false }) {
    return (
        <Card size={compact ? 'sm' : 'default'}>
            <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                        <CardDescription>{title}</CardDescription>
                        <CardTitle className={compact ? 'text-2xl' : 'text-3xl'}>{value}</CardTitle>
                    </div>
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <Icon />
                    </div>
                </div>
            </CardHeader>
            {description && <CardContent className="text-sm text-muted-foreground">{description}</CardContent>}
        </Card>
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
