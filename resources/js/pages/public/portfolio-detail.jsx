import { Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';

export default function PortfolioDetail({ portfolio }) {
    return (
        <PublicLayout
            title={portfolio.title}
            description={portfolio.description}
        >
            <article className="mx-auto max-w-4xl px-4 py-12">
                <Link href="/portofolio" className="text-sm underline">
                    ← Kembali ke portofolio
                </Link>
                {portfolio.image && (
                    <img
                        src={`/storage/${portfolio.image}`}
                        alt={portfolio.title}
                        className="mt-5 h-auto max-h-none w-full rounded-2xl border object-contain"
                    />
                )}
                <h1 className="mt-6 text-4xl font-semibold">
                    {portfolio.title}
                </h1>
                <p className="mt-2 text-muted-foreground">
                    {portfolio.category}
                </p>
                <p className="mt-6">{portfolio.description}</p>
                {portfolio.project_url && (
                    <a
                        href={portfolio.project_url}
                        className="mt-6 inline-block rounded-lg border px-4 py-2"
                    >
                        Buka proyek
                    </a>
                )}
            </article>
        </PublicLayout>
    );
}
