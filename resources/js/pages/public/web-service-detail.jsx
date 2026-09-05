import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import PublicLayout from '@/layouts/public-layout';

export default function WebServiceDetail({ webService }) {
    const { publicSettings = {} } = usePage().props;
    const [message, setMessage] = useState(
        `Halo ForDev, saya tertarik dengan jasa ${webService.name}.`,
    );
    const whatsapp = (publicSettings.contact_whatsapp ?? '').replace(/\D/g, '');
    const number = whatsapp.startsWith('0')
        ? `62${whatsapp.slice(1)}`
        : whatsapp;
    const whatsappUrl = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    return (
        <PublicLayout
            title={webService.name}
            description={webService.description}
        >
            <article className="mx-auto max-w-4xl px-4 py-12">
                <Link href="/jasa-web" className="text-sm underline">
                    ← Kembali ke katalog
                </Link>
                <h1 className="mt-4 text-4xl font-semibold">
                    {webService.name}
                </h1>
                <p className="mt-2 text-xl text-muted-foreground">
                    Rp {Number(webService.price).toLocaleString('id-ID')}
                </p>
                <p className="mt-6">{webService.description}</p>
                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                    {webService.features.map((feature) => (
                        <li key={feature} className="rounded-lg border p-3">
                            ✓ {feature}
                        </li>
                    ))}
                </ul>
                <textarea
                    className="mt-8 min-h-28 w-full rounded-lg border bg-background p-3"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    aria-label="Pesan WhatsApp"
                />
                <Button
                    className="mt-3"
                    asChild
                    disabled={!message.trim() || !number}
                >
                    <a href={whatsappUrl} target="_blank" rel="noreferrer">
                        Kirim ke WhatsApp
                    </a>
                </Button>
            </article>
        </PublicLayout>
    );
}
