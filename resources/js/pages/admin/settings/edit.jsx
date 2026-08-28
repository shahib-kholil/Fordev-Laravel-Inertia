import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SettingsEdit({ settings }) {
    const { data, setData, put, processing, errors } = useForm({ contact_email: settings.contact_email ?? '', contact_whatsapp: settings.contact_whatsapp ?? '', contact_address: settings.contact_address ?? '', social_instagram: settings.social_instagram ?? '' });
    function submit(e) { e.preventDefault(); put('/admin/settings'); }
    return <><Head title="Settings" /><form onSubmit={submit} className="max-w-2xl space-y-4 p-4"><h1 className="text-2xl font-semibold">Settings</h1><Field label="Email" error={errors.contact_email}><Input type="email" value={data.contact_email} onChange={(e) => setData('contact_email', e.target.value)} /></Field><Field label="WhatsApp" error={errors.contact_whatsapp}><Input value={data.contact_whatsapp} onChange={(e) => setData('contact_whatsapp', e.target.value)} /></Field><Field label="Alamat" error={errors.contact_address}><textarea className="min-h-24 w-full rounded-lg border bg-transparent p-2 text-sm" value={data.contact_address} onChange={(e) => setData('contact_address', e.target.value)} /></Field><Field label="Instagram" error={errors.social_instagram}><Input type="url" value={data.social_instagram} onChange={(e) => setData('social_instagram', e.target.value)} /></Field><Button disabled={processing}>Simpan</Button></form></>;
}
function Field({ label, error, children }) { return <div className="grid gap-2"><Label>{label}</Label>{children}<InputError message={error} /></div>; }
SettingsEdit.layout = { breadcrumbs: [{ title: 'Settings', href: '/admin/settings' }] };
