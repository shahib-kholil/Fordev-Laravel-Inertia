import { Head, Link, router } from '@inertiajs/react';
import { GripVertical } from 'lucide-react';
import { useState } from 'react';
import { AdminPageShell } from '@/components/admin/page-shell';
import {
    AdminActions,
    AdminTable,
    AdminTableCard,
} from '@/components/admin/table-card';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/pagination';
import AdminSearch from '@/components/admin-search';

export default function DomainsIndex({ domains, filters }) {
    const [rows, setRows] = useState(domains.data);
    const [dragId, setDragId] = useState(null);

    function move(targetId) {
        if (!dragId || dragId === targetId) return;
        const from = rows.findIndex((item) => item.id === dragId);
        const to = rows.findIndex((item) => item.id === targetId);
        const next = [...rows];
        next.splice(to, 0, next.splice(from, 1)[0]);
        setRows(next);
        router.put(
            '/admin/domains/reorder',
            { ids: next.map((item) => item.id) },
            { preserveScroll: true },
        );
    }

    return (
        <>
            <Head title="Domain" />
            <AdminPageShell
                title="Domain"
                description="Kelola ekstensi domain. Seret handle untuk mengubah urutan tabel publik."
                actions={
                    <Button asChild>
                        <Link href="/admin/domains/create">Tambah</Link>
                    </Button>
                }
            >
                <AdminTableCard
                    toolbar={
                        <AdminSearch
                            action="/admin/domains"
                            defaultValue={filters.q}
                            placeholder="Cari domain..."
                        />
                    }
                    pagination={<Pagination links={domains.links} />}
                >
                    <AdminTable>
                        <thead className="bg-muted/60 text-left">
                            <tr>
                                <th className="w-10 p-3"></th>
                                <th className="p-3">Ekstensi</th>
                                <th className="p-3">Daftar</th>
                                <th className="p-3">Perpanjang</th>
                                <th className="p-3">Transfer</th>
                                <th className="p-3">Kategori</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((domain) => (
                                <tr
                                    key={domain.id}
                                    className="border-t"
                                    draggable
                                    onDragStart={() => setDragId(domain.id)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => move(domain.id)}
                                >
                                    <td className="p-3 text-muted-foreground">
                                        <GripVertical className="size-4 cursor-grab" />
                                    </td>
                                    <td className="p-3 font-medium">
                                        {domain.extension}
                                    </td>
                                    <td className="p-3">
                                        Rp{' '}
                                        {Number(
                                            domain.promo_price || domain.price,
                                        ).toLocaleString('id-ID')}
                                        {domain.promo_price && (
                                            <span className="ml-2 text-xs text-muted-foreground line-through">
                                                Rp{' '}
                                                {Number(
                                                    domain.price,
                                                ).toLocaleString('id-ID')}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        Rp{' '}
                                        {Number(
                                            domain.renewal_price ||
                                                domain.price,
                                        ).toLocaleString('id-ID')}
                                    </td>
                                    <td className="p-3">
                                        {domain.transfer_price
                                            ? `Rp ${Number(domain.transfer_price).toLocaleString('id-ID')}`
                                            : '-'}
                                    </td>
                                    <td className="p-3">{domain.category}</td>
                                    <td className="p-3">
                                        {domain.is_available
                                            ? 'Tersedia'
                                            : 'Nonaktif'}
                                    </td>
                                    <td className="p-3 text-right">
                                        <AdminActions>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={`/admin/domains/${domain.id}/edit`}
                                                >
                                                    Edit
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    confirm(
                                                        'Hapus domain ini?',
                                                    ) &&
                                                    router.delete(
                                                        `/admin/domains/${domain.id}`,
                                                    )
                                                }
                                            >
                                                Hapus
                                            </Button>
                                        </AdminActions>
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

DomainsIndex.layout = {
    breadcrumbs: [{ title: 'Domain', href: '/admin/domains' }],
};
