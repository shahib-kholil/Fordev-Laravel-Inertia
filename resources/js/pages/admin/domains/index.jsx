import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/pagination';

export default function DomainsIndex({ domains }) {
    return (
        <>
            <Head title="Domain" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Domain</h1>
                        <p className="text-sm text-muted-foreground">Kelola ekstensi domain.</p>
                    </div>
                    <Button asChild><Link href="/admin/domains/create">Tambah</Link></Button>
                </div>

                <div className="overflow-hidden rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/60 text-left"><tr><th className="p-3">Ekstensi</th><th className="p-3">Harga</th><th className="p-3">Status</th><th className="p-3 text-right">Aksi</th></tr></thead>
                        <tbody>
                            {domains.data.map((domain) => (
                                <tr key={domain.id} className="border-t">
                                    <td className="p-3 font-medium">{domain.extension}</td>
                                    <td className="p-3">Rp {Number(domain.price).toLocaleString('id-ID')}</td>
                                    <td className="p-3">{domain.is_available ? 'Tersedia' : 'Nonaktif'}</td>
                                    <td className="space-x-2 p-3 text-right">
                                        <Button variant="outline" size="sm" asChild><Link href={`/admin/domains/${domain.id}/edit`}>Edit</Link></Button>
                                        <Button variant="destructive" size="sm" onClick={() => confirm('Hapus domain ini?') && router.delete(`/admin/domains/${domain.id}`)}>Hapus</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination links={domains.links} />
            </div>
        </>
    );
}

DomainsIndex.layout = { breadcrumbs: [{ title: 'Domain', href: '/admin/domains' }] };
