import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/pagination';

export default function PortfoliosIndex({ portfolios }) {
    return (
        <>
            <Head title="Portofolio" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div><h1 className="text-2xl font-semibold">Portofolio</h1><p className="text-sm text-muted-foreground">Kelola galeri proyek.</p></div>
                    <Button asChild><Link href="/admin/portfolios/create">Tambah</Link></Button>
                </div>
                <div className="overflow-hidden rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/60 text-left"><tr><th className="p-3">Judul</th><th className="p-3">Kategori</th><th className="p-3">Featured</th><th className="p-3 text-right">Aksi</th></tr></thead>
                        <tbody>{portfolios.data.map((item) => <tr key={item.id} className="border-t"><td className="p-3"><div className="font-medium">{item.title}</div><div className="text-muted-foreground">{item.slug}</div></td><td className="p-3">{item.category ?? '-'}</td><td className="p-3">{item.is_featured ? 'Ya' : 'Tidak'}</td><td className="space-x-2 p-3 text-right"><Button variant="outline" size="sm" asChild><Link href={`/admin/portfolios/${item.id}/edit`}>Edit</Link></Button><Button variant="destructive" size="sm" onClick={() => confirm('Hapus portofolio ini?') && router.delete(`/admin/portfolios/${item.id}`)}>Hapus</Button></td></tr>)}</tbody>
                    </table>
                </div>
                <Pagination links={portfolios.links} />
            </div>
        </>
    );
}

PortfoliosIndex.layout = { breadcrumbs: [{ title: 'Portofolio', href: '/admin/portfolios' }] };
