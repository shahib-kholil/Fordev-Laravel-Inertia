import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function toLocalDateTime(value) {
    if (!value) return '';
    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function DomainForm({ domain }) {
    const editing = Boolean(domain);
    const { data, setData, post, put, processing, errors } = useForm({
        extension: domain?.extension ?? '',
        price: domain?.price ?? '',
        promo_price: domain?.promo_price ?? '',
        renewal_price: domain?.renewal_price ?? '',
        transfer_price: domain?.transfer_price ?? '',

        badge: domain?.badge ?? '',
        is_available: domain?.is_available ?? true,
        coupons: (domain?.coupons ?? []).map((coupon) => ({
            ...coupon,
            type: 'fixed',
            starts_at: toLocalDateTime(coupon.starts_at),
            ends_at: toLocalDateTime(coupon.ends_at),
        })),
    });

    function updateCoupon(index, changes) {
        setData(
            'coupons',
            data.coupons.map((coupon, i) =>
                i === index ? { ...coupon, ...changes } : coupon,
            ),
        );
    }

    function submit(e) {
        e.preventDefault();
        editing ? put(`/admin/domains/${domain.id}`) : post('/admin/domains');
    }

    return (
        <>
            <Head title={editing ? 'Edit Domain' : 'Tambah Domain'} />
            <form onSubmit={submit} className="max-w-xl space-y-4 p-4">
                <h1 className="text-2xl font-semibold">
                    {editing ? 'Edit Domain' : 'Tambah Domain'}
                </h1>
                <Field label="Ekstensi" error={errors.extension}>
                    <Input
                        value={data.extension}
                        onChange={(e) => setData('extension', e.target.value)}
                        placeholder=".com"
                        required
                    />
                </Field>
                <Field label="Harga Normal" error={errors.price}>
                    <Input
                        type="number"
                        min="0"
                        value={data.price}
                        onChange={(e) => setData('price', e.target.value)}
                        required
                    />
                </Field>
                <Field label="Harga Promo" error={errors.promo_price}>
                    <Input
                        type="number"
                        min="0"
                        value={data.promo_price}
                        onChange={(e) => setData('promo_price', e.target.value)}
                        placeholder="Kosongkan jika tidak promo"
                    />
                </Field>
                <Field label="Biaya Perpanjangan" error={errors.renewal_price}>
                    <Input
                        type="number"
                        min="0"
                        value={data.renewal_price}
                        onChange={(e) =>
                            setData('renewal_price', e.target.value)
                        }
                        placeholder="Kosongkan jika sama dengan harga normal"
                    />
                </Field>
                <Field label="Biaya Transfer" error={errors.transfer_price}>
                    <Input
                        type="number"
                        min="0"
                        value={data.transfer_price}
                        onChange={(e) =>
                            setData('transfer_price', e.target.value)
                        }
                        placeholder="Kosongkan jika tidak tersedia"
                    />
                </Field>

                <Field label="Badge" error={errors.badge}>
                    <Input
                        value={data.badge}
                        onChange={(e) => setData('badge', e.target.value)}
                        placeholder="Promo terbatas / Premium"
                    />
                </Field>
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={data.is_available}
                        onChange={(e) =>
                            setData('is_available', e.target.checked)
                        }
                    />{' '}
                    Tampilkan di publik
                </label>
                <div className="space-y-3 border-t pt-4">
                    <h2 className="font-semibold">Kupon pembelian domain</h2>
                    {data.coupons.map((coupon, index) => (
                        <div
                            key={coupon.id ?? index}
                            className="grid gap-2 rounded-xl border p-3 sm:grid-cols-2"
                        >
                            <Label className="text-xs">Kode Kupon</Label>
                            <Input
                                placeholder="KODEPROMO"
                                value={coupon.code}
                                onChange={(e) =>
                                    updateCoupon(index, {
                                        code: e.target.value.toUpperCase(),
                                    })
                                }
                            />
                            <Label className="text-xs">Tipe Diskon</Label>
                            <select
                                className="rounded-lg border bg-transparent px-3 text-sm"
                                value={coupon.type}
                                onChange={(e) =>
                                    updateCoupon(index, {
                                        type: e.target.value,
                                    })
                                }
                            >
                                <option value="percent">Persentase (%)</option>
                                <option value="fixed">Nominal (Rp)</option>
                            </select>
                            <Label className="text-xs">Nilai Diskon</Label>
                            <Input
                                type="number"
                                min="1"
                                max={
                                    coupon.type === 'percent' ? 100 : 100000000
                                }
                                placeholder={
                                    coupon.type === 'percent'
                                        ? 'Contoh: 10'
                                        : 'Contoh: 50000'
                                }
                                value={coupon.value}
                                onChange={(e) =>
                                    updateCoupon(index, {
                                        value: e.target.value,
                                    })
                                }
                            />
                            <Label className="text-xs">Berlaku Dari</Label>
                            <Input
                                type="datetime-local"
                                value={coupon.starts_at ?? ''}
                                onChange={(e) =>
                                    updateCoupon(index, {
                                        starts_at: e.target.value,
                                    })
                                }
                            />
                            <Label className="text-xs">Berlaku Sampai</Label>
                            <Input
                                type="datetime-local"
                                value={coupon.ends_at ?? ''}
                                onChange={(e) =>
                                    updateCoupon(index, {
                                        ends_at: e.target.value,
                                    })
                                }
                            />
                            <Label className="text-xs">Batas Pemakaian</Label>
                            <Input
                                type="number"
                                min="1"
                                placeholder="Opsional"
                                value={coupon.max_uses ?? ''}
                                onChange={(e) =>
                                    updateCoupon(index, {
                                        max_uses: e.target.value,
                                    })
                                }
                            />
                            <p className="text-xs text-muted-foreground sm:col-span-2">
                                Kosongkan tanggal jika kupon tidak memiliki
                                batas waktu.
                            </p>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={coupon.is_active ?? true}
                                    onChange={(e) =>
                                        updateCoupon(index, {
                                            is_active: e.target.checked,
                                        })
                                    }
                                />{' '}
                                Aktif ({coupon.used_count ?? 0} kali digunakan)
                            </label>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() =>
                                    window.confirm(
                                        `Yakin hapus kupon ${coupon.code || 'ini'}?`,
                                    ) &&
                                    setData(
                                        'coupons',
                                        data.coupons.filter(
                                            (_, i) => i !== index,
                                        ),
                                    )
                                }
                            >
                                Hapus kupon
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="default"
                        onClick={() =>
                            setData('coupons', [
                                ...data.coupons,
                                {
                                    code: '',
                                    type: 'fixed',
                                    value: '',
                                    starts_at: '',
                                    ends_at: '',
                                    max_uses: '',
                                    is_active: true,
                                },
                            ])
                        }
                    >
                        Tambah kupon
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Button disabled={processing}>Simpan</Button>
                    <Button variant="outline" asChild>
                        <Link href="/admin/domains">Batal</Link>
                    </Button>
                </div>
            </form>
        </>
    );
}

function Field({ label, error, children }) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

DomainForm.layout = {
    breadcrumbs: [{ title: 'Domain', href: '/admin/domains' }],
};
