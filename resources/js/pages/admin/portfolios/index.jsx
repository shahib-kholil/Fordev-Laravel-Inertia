import { Head, Link, router } from '@inertiajs/react';
import { AdminPageShell } from '@/components/admin/page-shell';
import { AdminActions, AdminTable, AdminTableCard } from '@/components/admin/table-card';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/pagination';
import AdminSearch from '@/components/admin-search';

export default function PortfoliosIndex({ portfolios, filters }) {
    return (
        <>
            <Head title="Portofolio" />
            <AdminPageShell
                title="Portofolio"
                description="Kelola karya yang ditampilkan."
                actions={<Button asChild><Link href="/admin/portfolios/create">Tambah</Link></Button>}
            >
                <AdminTableCard
                    toolbar={<AdminSearch action="/admin/portfolios" defaultValue={filters.q} placeholder="Cari portofolio..." />}
                    pagination={<Pagination links={portfolios.links} />}
                >
                    <AdminTable>
                        <thead className="bg-muted/60 text-left"><tr><th className="p-3">Judul</th><th className="p-3">Kategori</th><th className="p-3">Featured</th><th className="p-3 text-right">Aksi</th></tr></thead>
                        <tbody>{portfolios.data.map((item) => <tr key={item.id} className="border-t"><td className="p-3"><div className="font-medium">{item.title}</div><div className="text-muted-foreground">{item.slug}</div></td><td className="p-3">{item.category ?? '-'}</td><td className="p-3">{item.is_featured ? 'Ya' : 'Tidak'}</td><td className="p-3 text-right"><Button variant="outline" size="sm" asChild><Link href={`/admin/portfolios/${item.id}/edit`}>Edit</Link></Button><Button variant="destructive" size="sm" onClick={() => confirm('Hapus portofolio ini?') && router.delete(`/admin/portfolios/${item.id}`)}>Hapus</Button></td></tr>)}</tbody>
                    </AdminTable>
                </AdminTableCard>

            </AdminPageShell>
        </>
    );
}

PortfoliosIndex.layout = { breadcrumbs: [{ title: 'Portofolio', href: '/admin/portfolios' }] };
