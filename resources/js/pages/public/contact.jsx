import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PublicLayout from '@/layouts/public-layout';

export default function Contact() {
    const { publicSettings = {} } = usePage().props;
    const [message, setMessage] = useState('');
    const whatsapp = (publicSettings.contact_whatsapp ?? '').replace(/\D/g, '');
    const number = whatsapp.startsWith('0')
        ? `62${whatsapp.slice(1)}`
        : whatsapp;
    const whatsappUrl = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

    return (
        <PublicLayout title="Contact">
            <section className="mx-auto max-w-3xl px-4 py-12">
                <p className="text-sm font-medium text-primary">Contact kami</p>
                <h1 className="mt-2 text-4xl font-semibold">
                    Mari ngobrol tentang kebutuhanmu
                </h1>
                <div className="mt-8 grid gap-4 rounded-2xl border bg-card p-6">
                    <p>Email: {publicSettings.contact_email || '-'}</p>
                    <p>WhatsApp: {publicSettings.contact_whatsapp || '-'}</p>
                    <p>Alamat: {publicSettings.contact_address || '-'}</p>
                    <Input
                        placeholder="Tulis pesan singkat"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button asChild disabled={!message.trim() || !number}>
                        <a href={whatsappUrl} target="_blank" rel="noreferrer">
                            Kirim pesan via WhatsApp
                        </a>
                    </Button>
                </div>
            </section>
        </PublicLayout>
    );
}
