import { Head, Link, router, useForm } from '@inertiajs/react';
import { GripVertical } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminPageShell } from '@/components/admin/page-shell';
import {
    AdminActions,
    AdminTable,
    AdminTableCard,
} from '@/components/admin/table-card';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/pagination';
import AdminSearch from '@/components/admin-search';
import { Input } from '@/components/ui/input';

export default function DomainsIndex({
    domains,
    filters,
    bundles = [],
    domainOptions = [],
}) {
    const [rows, setRows] = useState(domains.data);
    const [dragId, setDragId] = useState(null);

    useEffect(() => {
        setRows(domains.data);
    }, [domains.data]);

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
            <BundleSettings bundles={bundles} domainOptions={domainOptions} />
        </>
    );
}

function BundleSettings({ bundles: initialBundles, domainOptions }) {
    const { data, setData, put, processing, errors } = useForm({
        bundles: initialBundles,
    });
    const update = (index, changes) =>
        setData(
            'bundles',
            data.bundles.map((item, i) =>
                i === index ? { ...item, ...changes } : item,
            ),
        );

    return (
        <AdminPageShell
            title="Bundling domain"
            description="Atur paket bundling yang tampil di halaman publik."
        >
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    put('/admin/domains/bundles');
                }}
                className="space-y-4"
            >
                {data.bundles.map((bundle, index) => (
                    <div
                        key={index}
                        className="grid gap-3 rounded-2xl border p-4"
                    >
                        <Input
                            value={bundle.name}
                            placeholder="Nama paket"
                            onChange={(e) =>
                                update(index, { name: e.target.value })
                            }
                        />
                        <textarea
                            className="min-h-20 w-full rounded-lg border bg-transparent p-2 text-sm"
                            value={bundle.description ?? ''}
                            placeholder="Deskripsi"
                            onChange={(e) =>
                                update(index, { description: e.target.value })
                            }
                        />
                        <div className="grid gap-2 sm:grid-cols-3">
                            {domainOptions.map((domain) => (
                                <label
                                    key={domain.id}
                                    className="flex items-center gap-2 text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={(
                                            bundle.domain_ids ?? []
                                        ).includes(domain.id)}
                                        onChange={(e) =>
                                            update(index, {
                                                domain_ids: e.target.checked
                                                    ? [
                                                          ...(bundle.domain_ids ??
                                                              []),
                                                          domain.id,
                                                      ]
                                                    : (
                                                          bundle.domain_ids ??
                                                          []
                                                      ).filter(
                                                          (id) =>
                                                              id !== domain.id,
                                                      ),
                                            })
                                        }
                                    />
                                    {domain.extension}
                                </label>
                            ))}
                        </div>
                        <Input
                            type="number"
                            min="0"
                            value={bundle.price}
                            placeholder="Harga bundling"
                            onChange={(e) =>
                                update(index, { price: e.target.value })
                            }
                        />
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={bundle.is_active}
                                onChange={(e) =>
                                    update(index, {
                                        is_active: e.target.checked,
                                    })
                                }
                            />{' '}
                            Tampilkan di publik
                        </label>
                        {errors[`bundles.${index}.domain_ids`] && (
                            <p className="text-sm text-destructive">
                                Pilih minimal dua ekstensi.
                            </p>
                        )}
                    </div>
                ))}
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            setData('bundles', [
                                ...data.bundles,
                                {
                                    name: '',
                                    description: '',
                                    domain_ids: [],
                                    price: '',
                                    is_active: true,
                                },
                            ])
                        }
                    >
                        Tambah bundling
                    </Button>
                    <Button disabled={processing}>Simpan bundling</Button>
                </div>
            </form>
        </AdminPageShell>
    );
}

DomainsIndex.layout = {
    breadcrumbs: [{ title: 'Domain', href: '/admin/domains' }],
};
