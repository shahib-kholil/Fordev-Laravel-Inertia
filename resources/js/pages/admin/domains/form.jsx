import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DomainForm({ domain }) {
    const editing = Boolean(domain);
    const { data, setData, post, put, processing, errors } = useForm({
        extension: domain?.extension ?? '',
        price: domain?.price ?? '',
        is_available: domain?.is_available ?? true,
    });

    function submit(e) {
        e.preventDefault();
        editing ? put(`/admin/domains/${domain.id}`) : post('/admin/domains');
    }

    return (
        <>
            <Head title={editing ? 'Edit Domain' : 'Tambah Domain'} />
            <form onSubmit={submit} className="max-w-xl space-y-4 p-4">
                <h1 className="text-2xl font-semibold">{editing ? 'Edit Domain' : 'Tambah Domain'}</h1>
                <Field label="Ekstensi" error={errors.extension}><Input value={data.extension} onChange={(e) => setData('extension', e.target.value)} placeholder=".com" required /></Field>
                <Field label="Harga" error={errors.price}><Input type="number" min="0" value={data.price} onChange={(e) => setData('price', e.target.value)} required /></Field>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.is_available} onChange={(e) => setData('is_available', e.target.checked)} /> Tersedia</label>
                <div className="flex gap-2"><Button disabled={processing}>Simpan</Button><Button variant="outline" asChild><Link href="/admin/domains">Batal</Link></Button></div>
            </form>
        </>
    );
}

function Field({ label, error, children }) {
    return <div className="grid gap-2"><Label>{label}</Label>{children}<InputError message={error} /></div>;
}

DomainForm.layout = { breadcrumbs: [{ title: 'Domain', href: '/admin/domains' }] };
