import { Head, Link, router } from '@inertiajs/react';
import { AdminPageShell } from '@/components/admin/page-shell';
import {
    AdminActions,
    AdminTable,
    AdminTableCard,
} from '@/components/admin/table-card';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/pagination';
import AdminSearch from '@/components/admin-search';

export default function TestimonialsIndex({ testimonials, filters }) {
    return (
        <>
            <Head title="Testimoni" />
            <AdminPageShell
                title="Testimoni"
                description="Kelola testimoni klien."
                actions={
                    <Button asChild>
                        <Link href="/admin/testimonials/create">Tambah</Link>
                    </Button>
                }
            >
                <AdminTableCard
                    toolbar={
                        <AdminSearch
                            action="/admin/testimonials"
                            defaultValue={filters.q}
                            placeholder="Cari testimoni..."
                        />
                    }
                    pagination={<Pagination links={testimonials.links} />}
                >
                    <AdminTable>
                        <thead className="bg-muted/60 text-left">
                            <tr>
                                <th className="p-3">Klien</th>
                                <th className="p-3">Rating</th>
                                <th className="p-3">Featured</th>
                                <th className="p-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {testimonials.data.map((item) => (
                                <tr key={item.id} className="border-t">
                                    <td className="p-3">
                                        <div className="font-medium">
                                            {item.client_name}
                                        </div>
                                        <div className="text-muted-foreground">
                                            {item.client_role ?? '-'}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        {item.rating ?? '-'}
                                    </td>
                                    <td className="p-3">
                                        {item.is_featured ? 'Ya' : 'Tidak'}
                                    </td>
                                    <td className="p-3 text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={`/admin/testimonials/${item.id}/edit`}
                                            >
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                confirm(
                                                    'Hapus testimoni ini?',
                                                ) &&
                                                router.delete(
                                                    `/admin/testimonials/${item.id}`,
                                                )
                                            }
                                        >
                                            Hapus
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

TestimonialsIndex.layout = {
    breadcrumbs: [{ title: 'Testimoni', href: '/admin/testimonials' }],
};
