import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PublicLayout from '@/layouts/public-layout';
import Pagination from '@/components/pagination';

export default function Portfolios({ portfolios }) {
    return (
        <PublicLayout title="Galeri Portofolio">
            <div className="mx-auto max-w-6xl px-4 py-12">
                <h1 className="mb-6 text-3xl font-semibold">
                    Galeri Portofolio
                </h1>
                <div className="grid auto-rows-[16rem] gap-3 sm:grid-cols-2 lg:auto-rows-[19rem] lg:grid-cols-12">
                    {portfolios.data.map((item, index) => (
                        <article
                            key={item.id}
                            className={`group relative isolate overflow-hidden rounded-3xl border bg-muted ${['lg:col-span-7', 'lg:col-span-5', 'lg:col-span-4', 'lg:col-span-8'][index % 4]}`}
                        >
                            {item.image && (
                                <img
                                    src={`/storage/${item.image}`}
                                    alt=""
                                    className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                />
                            )}
                            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-background/60 [mask-image:linear-gradient(to_top,black_25%,transparent)]" />
                            <Link
                                href={`/portofolio/${item.slug}`}
                                className="absolute inset-0 z-20 rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                                aria-label={`Lihat proyek ${item.title}`}
                            />
                            <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-5 sm:p-6">
                                <div className="min-w-0">
                                    <Badge variant="secondary" className="mb-3">
                                        {item.category ?? 'Website'}
                                    </Badge>
                                    <h2 className="truncate text-xl font-semibold text-foreground sm:text-2xl">
                                        {item.title}
                                    </h2>
                                </div>
                                {item.project_url ? (
                                    <a
                                        href={item.project_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="relative z-30 grid size-10 shrink-0 place-items-center rounded-full border bg-background text-foreground transition-transform duration-300 hover:translate-x-1 hover:-translate-y-1"
                                        aria-label={`Buka website ${item.title}`}
                                    >
                                        <ArrowUpRight className="size-5" />
                                    </a>
                                ) : (
                                    <span className="grid size-10 shrink-0 place-items-center rounded-full border bg-background text-foreground">
                                        <ArrowUpRight className="size-5" />
                                    </span>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
                <div className="mt-6">
                    <Pagination links={portfolios.links} />
                </div>
            </div>
        </PublicLayout>
    );
}
