import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/pagination';

export default function TestimonialsIndex({ testimonials }) {
    return (
        <>
            <Head title="Testimoni" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div><h1 className="text-2xl font-semibold">Testimoni</h1><p className="text-sm text-muted-foreground">Kelola testimoni klien.</p></div>
                    <Button asChild><Link href="/admin/testimonials/create">Tambah</Link></Button>
                </div>
                <div className="overflow-hidden rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/60 text-left"><tr><th className="p-3">Klien</th><th className="p-3">Rating</th><th className="p-3">Featured</th><th className="p-3 text-right">Aksi</th></tr></thead>
                        <tbody>{testimonials.data.map((item) => <tr key={item.id} className="border-t"><td className="p-3"><div className="font-medium">{item.client_name}</div><div className="text-muted-foreground">{item.client_role ?? '-'}</div></td><td className="p-3">{item.rating ?? '-'}</td><td className="p-3">{item.is_featured ? 'Ya' : 'Tidak'}</td><td className="space-x-2 p-3 text-right"><Button variant="outline" size="sm" asChild><Link href={`/admin/testimonials/${item.id}/edit`}>Edit</Link></Button><Button variant="destructive" size="sm" onClick={() => confirm('Hapus testimoni ini?') && router.delete(`/admin/testimonials/${item.id}`)}>Hapus</Button></td></tr>)}</tbody>
                    </table>
                </div>
                <Pagination links={testimonials.links} />
            </div>
        </>
    );
}

TestimonialsIndex.layout = { breadcrumbs: [{ title: 'Testimoni', href: '/admin/testimonials' }] };
