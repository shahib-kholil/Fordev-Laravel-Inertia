import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function WebServiceForm({ webService }) {
    const editing = Boolean(webService);
    const { data, setData, post, put, processing, errors } = useForm({
        name: webService?.name ?? '',
        slug: webService?.slug ?? '',
        description: webService?.description ?? '',
        price: webService?.price ?? '',
        features: (webService?.features ?? []).join('\n'),
        image: webService?.image ?? '',
        is_active: webService?.is_active ?? true,
    });

    function submit(e) {
        e.preventDefault();
        editing
            ? put(`/admin/web-services/${webService.id}`)
            : post('/admin/web-services');
    }

    return (
        <>
            <Head title={editing ? 'Edit Paket' : 'Tambah Paket'} />
            <form onSubmit={submit} className="max-w-2xl space-y-4 p-4">
                <h1 className="text-2xl font-semibold">
                    {editing ? 'Edit Paket' : 'Tambah Paket'}
                </h1>
                <Field label="Nama" error={errors.name}>
                    <Input
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                </Field>
                <Field label="Slug" error={errors.slug}>
                    <Input
                        value={data.slug}
                        onChange={(e) => setData('slug', e.target.value)}
                        placeholder="auto jika kosong"
                    />
                </Field>
                <Field label="Deskripsi" error={errors.description}>
                    <textarea
                        className="min-h-24 w-full rounded-lg border bg-transparent p-2 text-sm"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        required
                    />
                </Field>
                <Field label="Harga" error={errors.price}>
                    <Input
                        type="number"
                        min="0"
                        value={data.price}
                        onChange={(e) => setData('price', e.target.value)}
                        required
                    />
                </Field>
                <Field label="Fitur (satu per baris)" error={errors.features}>
                    <textarea
                        className="min-h-32 w-full rounded-lg border bg-transparent p-2 text-sm"
                        value={data.features}
                        onChange={(e) => setData('features', e.target.value)}
                    />
                </Field>
                <Field label="Gambar" error={errors.image}>
                    <Input
                        value={data.image}
                        onChange={(e) => setData('image', e.target.value)}
                        placeholder="path gambar"
                    />
                </Field>
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                    />{' '}
                    Aktif
                </label>
                <div className="flex gap-2">
                    <Button disabled={processing}>Simpan</Button>
                    <Button variant="outline" asChild>
                        <Link href="/admin/web-services">Batal</Link>
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

WebServiceForm.layout = {
    breadcrumbs: [{ title: 'Paket Jasa', href: '/admin/web-services' }],
};
