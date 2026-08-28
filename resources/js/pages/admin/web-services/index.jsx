import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/pagination';

export default function WebServicesIndex({ webServices }) {
    return (
        <>
            <Head title="Paket Jasa" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Paket Jasa</h1>
                        <p className="text-sm text-muted-foreground">Kelola paket website.</p>
                    </div>
                    <Button asChild><Link href="/admin/web-services/create">Tambah</Link></Button>
                </div>

                <div className="overflow-hidden rounded-xl border">
                    <table className="w-full text-sm">
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
                                    <td className="space-x-2 p-3 text-right">
                                        <Button variant="outline" size="sm" asChild><Link href={`/admin/web-services/${item.id}/edit`}>Edit</Link></Button>
                                        <Button variant="destructive" size="sm" onClick={() => confirm('Hapus paket ini?') && router.delete(`/admin/web-services/${item.id}`)}>Hapus</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination links={webServices.links} />
            </div>
        </>
    );
}

WebServicesIndex.layout = { breadcrumbs: [{ title: 'Paket Jasa', href: '/admin/web-services' }] };
