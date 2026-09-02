import { Link } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function WebServiceCard({ item, featured = false }) {
    return (
        <article
            className={`flex h-full flex-col rounded-3xl border bg-card p-6 shadow-sm ${featured ? 'border-primary bg-primary text-primary-foreground shadow-lg' : ''}`}
        >
            {featured && (
                <Badge className="mb-5 self-start bg-primary-foreground/15 text-primary-foreground">
                    Pilihan populer
                </Badge>
            )}
            <h2 className="text-2xl font-semibold">{item.name}</h2>
            <p
                className={`mt-2 min-h-12 text-sm ${featured ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}
            >
                {item.description}
            </p>
            <p className="mt-6 text-3xl font-semibold">
                Rp {Number(item.price).toLocaleString('id-ID')}
                <span className="text-sm font-normal opacity-70">/paket</span>
            </p>
            <Button
                asChild
                variant={featured ? 'secondary' : 'outline'}
                className="mt-6 w-full"
            >
                <Link href={`/order?web_service_id=${item.id}`}>
                    Pilih paket
                </Link>
            </Button>
            <div
                className={`my-6 border-t ${featured ? 'border-primary-foreground/20' : 'border-border'}`}
            />
            <h3 className="mb-4 text-sm font-semibold">
                Keuntungan yang didapat
            </h3>
            <ul className="space-y-3 text-sm">
                {(item.features ?? []).map((feature) => (
                    <li key={feature} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        </article>
    );
}

WebServiceCard.displayName = 'WebServiceCard';

export default WebServiceCard;
