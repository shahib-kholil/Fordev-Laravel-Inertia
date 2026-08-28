import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TestimonialForm({ testimonial }) {
    const editing = Boolean(testimonial);
    const { data, setData, post, processing, errors } = useForm({
        client_name: testimonial?.client_name ?? '', client_role: testimonial?.client_role ?? '', client_photo: null,
        content: testimonial?.content ?? '', rating: testimonial?.rating ?? '', is_featured: testimonial?.is_featured ?? true,
    });
    function submit(e) { e.preventDefault(); post(editing ? `/admin/testimonials/${testimonial.id}?_method=PUT` : '/admin/testimonials', { forceFormData: true }); }
    return <><Head title={editing ? 'Edit Testimoni' : 'Tambah Testimoni'} /><form onSubmit={submit} className="max-w-2xl space-y-4 p-4"><h1 className="text-2xl font-semibold">{editing ? 'Edit Testimoni' : 'Tambah Testimoni'}</h1><Field label="Nama Klien" error={errors.client_name}><Input value={data.client_name} onChange={(e) => setData('client_name', e.target.value)} required /></Field><Field label="Role Klien" error={errors.client_role}><Input value={data.client_role} onChange={(e) => setData('client_role', e.target.value)} /></Field><Field label="Foto Klien" error={errors.client_photo}><Input type="file" accept="image/*" onChange={(e) => setData('client_photo', e.target.files[0])} /></Field><Field label="Isi Testimoni" error={errors.content}><textarea className="min-h-32 w-full rounded-lg border bg-transparent p-2 text-sm" value={data.content} onChange={(e) => setData('content', e.target.value)} required /></Field><Field label="Rating" error={errors.rating}><Input type="number" min="1" max="5" value={data.rating} onChange={(e) => setData('rating', e.target.value)} /></Field><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.is_featured} onChange={(e) => setData('is_featured', e.target.checked)} /> Featured</label><div className="flex gap-2"><Button disabled={processing}>Simpan</Button><Button variant="outline" asChild><Link href="/admin/testimonials">Batal</Link></Button></div></form></>;
}

function Field({ label, error, children }) { return <div className="grid gap-2"><Label>{label}</Label>{children}<InputError message={error} /></div>; }

TestimonialForm.layout = { breadcrumbs: [{ title: 'Testimoni', href: '/admin/testimonials' }] };
