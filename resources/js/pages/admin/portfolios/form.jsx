import { Head, Link, useForm } from '@inertiajs/react';
import ImageUploadPreview from '@/components/image-upload-preview';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PortfolioForm({ portfolio }) {
    const editing = Boolean(portfolio);
    const { data, setData, post, processing, errors } = useForm({
        title: portfolio?.title ?? '', slug: portfolio?.slug ?? '', description: portfolio?.description ?? '', image: null,
        project_url: portfolio?.project_url ?? '', category: portfolio?.category ?? '', is_featured: portfolio?.is_featured ?? false,
        order_position: portfolio?.order_position ?? 0,
    });
    function submit(e) { e.preventDefault(); post(editing ? `/admin/portfolios/${portfolio.id}?_method=PUT` : '/admin/portfolios', { forceFormData: true }); }
    return <><Head title={editing ? 'Edit Portofolio' : 'Tambah Portofolio'} /><form onSubmit={submit} className="max-w-2xl space-y-4 p-4"><h1 className="text-2xl font-semibold">{editing ? 'Edit Portofolio' : 'Tambah Portofolio'}</h1><Field label="Judul" error={errors.title}><Input value={data.title} onChange={(e) => setData('title', e.target.value)} required /></Field><Field label="Slug" error={errors.slug}><Input value={data.slug} onChange={(e) => setData('slug', e.target.value)} placeholder="auto jika kosong" /></Field><Field label="Deskripsi" error={errors.description}><textarea className="min-h-24 w-full rounded-lg border bg-transparent p-2 text-sm" value={data.description} onChange={(e) => setData('description', e.target.value)} /></Field><Field label="Gambar" error={errors.image}><ImageUploadPreview file={data.image} currentPath={portfolio?.image} alt={data.title || 'Preview portofolio'} /><Input type="file" accept="image/*" onChange={(e) => setData('image', e.target.files[0])} required={!editing} /></Field><Field label="URL Proyek" error={errors.project_url}><Input type="url" value={data.project_url} onChange={(e) => setData('project_url', e.target.value)} /></Field><Field label="Kategori" error={errors.category}><Input value={data.category} onChange={(e) => setData('category', e.target.value)} /></Field><Field label="Urutan" error={errors.order_position}><Input type="number" min="0" value={data.order_position} onChange={(e) => setData('order_position', e.target.value)} /></Field><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.is_featured} onChange={(e) => setData('is_featured', e.target.checked)} /> Featured</label><div className="flex gap-2"><Button disabled={processing}>Simpan</Button><Button variant="outline" asChild><Link href="/admin/portfolios">Batal</Link></Button></div></form></>;
}

function Field({ label, error, children }) { return <div className="grid gap-2"><Label>{label}</Label>{children}<InputError message={error} /></div>; }

PortfolioForm.layout = { breadcrumbs: [{ title: 'Portofolio', href: '/admin/portfolios' }] };
