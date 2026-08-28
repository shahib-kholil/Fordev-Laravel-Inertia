import { Head, Link, router } from '@inertiajs/react';
import { AdminPageShell } from '@/components/admin/page-shell';
import { AdminActions, AdminTable, AdminTableCard } from '@/components/admin/table-card';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/pagination';
import AdminSearch from '@/components/admin-search';

export default function WebServicesIndex({ webServices, filters }) {
    return (
        <>
            <Head title="Paket Jasa" />
            <AdminPageShell
                title="Paket Jasa"
                description="Kelola paket website."
                actions={<Button asChild><Link href="/admin/web-services/create">Tambah</Link></Button>}
            >
                <AdminTableCard
                    toolbar={<AdminSearch action="/admin/web-services" defaultValue={filters.q} placeholder="Cari paket jasa..." />}
                    pagination={<Pagination links={webServices.links} />}
                >
                    <AdminTable>
                        <thead className="bg-muted/60 text-left">
                            <tr>
                                <th className="p-3">Nama</th><th className="p-3">Harga</th><th className="p-3">Status</th><th className="p-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {webServices.data.map((item) => (
                                <tr key={item.id} className="border-t">
                                    <td className="p-3"><div className="font-medium">{item.name}</div><div className="text-muted-foreground">{item.slug}</div></td>
                                    <td className="p-3">Rp {Number(item.price).toLocaleString('id-ID')}</td>
                                    <td className="p-3">{item.is_active ? 'Aktif' : 'Nonaktif'}</td>
                                    <td className="p-3 text-right"><AdminActions>
                                        <Button variant="outline" size="sm" asChild><Link href={`/admin/web-services/${item.id}/edit`}>Edit</Link></Button>
                                        <Button variant="destructive" size="sm" onClick={() => confirm('Hapus paket ini?') && router.delete(`/admin/web-services/${item.id}`)}>Hapus</Button>
                                    </AdminActions></td>
                                </tr>
                            ))}
                        </tbody>
                    </AdminTable>
                </AdminTableCard>

            </AdminPageShell>
        </>
    );
}

WebServicesIndex.layout = { breadcrumbs: [{ title: 'Paket Jasa', href: '/admin/web-services' }] };
