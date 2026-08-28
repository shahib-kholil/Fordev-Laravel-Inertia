import { Head, Link, router } from '@inertiajs/react';
import { AdminPageShell } from '@/components/admin/page-shell';
import { AdminActions, AdminTable, AdminTableCard } from '@/components/admin/table-card';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/pagination';
import AdminSearch from '@/components/admin-search';

export default function DomainsIndex({ domains, filters }) {
    return (
        <>
            <Head title="Domain" />
            <AdminPageShell
                title="Domain"
                description="Kelola ekstensi domain."
                actions={<Button asChild><Link href="/admin/domains/create">Tambah</Link></Button>}
            >
                <AdminTableCard
                    toolbar={<AdminSearch action="/admin/domains" defaultValue={filters.q} placeholder="Cari domain..." />}
                    pagination={<Pagination links={domains.links} />}
                >
                    <AdminTable>
                        <thead className="bg-muted/60 text-left"><tr><th className="p-3">Ekstensi</th><th className="p-3">Harga</th><th className="p-3">Status</th><th className="p-3 text-right">Aksi</th></tr></thead>
                        <tbody>
                            {domains.data.map((domain) => (
                                <tr key={domain.id} className="border-t">
                                    <td className="p-3 font-medium">{domain.extension}</td>
                                    <td className="p-3">Rp {Number(domain.price).toLocaleString('id-ID')}</td>
                                    <td className="p-3">{domain.is_available ? 'Tersedia' : 'Nonaktif'}</td>
                                    <td className="p-3 text-right"><AdminActions>
                                        <Button variant="outline" size="sm" asChild><Link href={`/admin/domains/${domain.id}/edit`}>Edit</Link></Button>
                                        <Button variant="destructive" size="sm" onClick={() => confirm('Hapus domain ini?') && router.delete(`/admin/domains/${domain.id}`)}>Hapus</Button>
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

DomainsIndex.layout = { breadcrumbs: [{ title: 'Domain', href: '/admin/domains' }] };
