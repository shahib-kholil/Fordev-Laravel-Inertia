import { Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';

export default function WebServiceDetail({ webService }) {
    return <PublicLayout title={webService.name} description={webService.description}><article className="mx-auto max-w-4xl px-4 py-12"><Link href="/jasa-web" className="text-sm underline">← Kembali ke katalog</Link><h1 className="mt-4 text-4xl font-semibold">{webService.name}</h1><p className="mt-2 text-xl text-muted-foreground">Rp {Number(webService.price).toLocaleString('id-ID')}</p><p className="mt-6">{webService.description}</p><ul className="mt-6 grid gap-2 sm:grid-cols-2">{webService.features.map((feature) => <li key={feature} className="rounded-lg border p-3">✓ {feature}</li>)}</ul><Link href={`/order?web_service_id=${webService.id}`} className="mt-8 inline-block rounded-lg bg-primary px-4 py-2 text-primary-foreground">Minta Penawaran</Link></article></PublicLayout>;
}
