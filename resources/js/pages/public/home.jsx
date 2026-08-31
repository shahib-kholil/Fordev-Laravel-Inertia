import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import HeroSection from '@/components/public/hero-section';
import LogoLoop from '@/components/public/Logo-Loop';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import PublicLayout from '@/layouts/public-layout';
import MagicBento from '@/components/public/magic-bento';

const techLogos = [
    {
        src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg',
        alt: 'Laravel',
        href: 'https://laravel.com',
    },
    {
        src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg',
        alt: 'PHP',
        href: 'https://php.net',
    },
    {
        src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
        alt: 'React',
        href: 'https://react.dev',
    },
    {
        src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
        alt: 'Python',
        href: 'https://www.python.org',
    },
    {
        src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg',
        alt: 'Django',
        href: 'https://www.djangoproject.com',
    },
    {
        src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg',
        alt: 'Tailwind CSS',
        href: 'https://tailwindcss.com',
    },
    {
        src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
        alt: 'JavaScript',
        href: 'https://developer.mozilla.org/docs/Web/JavaScript',
    },
    {
        src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
        alt: 'Docker',
        href: 'https://docker.com',
    },
    {
        src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
        alt: 'MySQL',
        href: 'https://mysql.com',
    },
    {
        src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg',
        alt: 'Vite',
        href: 'https://vite.dev',
    },
];

export default function Home({
    packageCards,
    webServices,
    portfolios,
    testimonials,
}) {
    return (
        <PublicLayout
            title="ForDev"
            description="Jasa pembuatan website, domain, portofolio, dan landing page."
        >
            <HeroSection />
            <PackagesSection packageCards={packageCards} />
            <ProjectsSection portfolios={portfolios} />
            <SkillsSection />
            <ServicesSection webServices={webServices} />
            <TestimonialsSection testimonials={testimonials} />
        </PublicLayout>
    );
}

function PackagesSection({ packageCards }) {
    return (
        <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
            <div className="mx-auto mb-6 max-w-2xl text-center sm:mb-8">
                <Badge variant="outline" className="mb-3">
                    Solusi ForDev
                </Badge>
                <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                    Pilih yang kamu butuhkan
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
                    Mulai dari domain sampai website siap pakai.
                </p>
            </div>
            <MagicBento cards={packageCards} />
        </section>
    );
}

function Section({ title, description, children }) {
    return (
        <section className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:py-16">
            <div className="mx-auto flex max-w-2xl flex-col gap-3 text-center">
                <h2 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
                    {title}
                </h2>
                {description && (
                    <p className="text-muted-foreground">{description}</p>
                )}
            </div>
            {children}
        </section>
    );
}

function ProjectsSection({ portfolios }) {
    return (
        <Section
            title="Project yang sudah dikirim"
            description="Dari website profil sampai landing page campaign, semuanya dibuat rapi dan mudah dikelola."
        >
            <div className="grid auto-rows-[16rem] gap-3 sm:grid-cols-2 lg:auto-rows-[19rem] lg:grid-cols-12">
                {portfolios.map((item, index) => (
                    <ProjectCard key={item.id} item={item} index={index} />
                ))}
            </div>
        </Section>
    );
}

function ProjectCard({ item, index }) {
    const desktopSize = [
        'lg:col-span-7',
        'lg:col-span-5',
        'lg:col-span-4',
        'lg:col-span-8',
    ][index % 4];

    return (
        <article
            className={`group relative isolate overflow-hidden rounded-3xl border bg-muted ${desktopSize}`}
        >
            {item.image && (
                <img
                    src={`/storage/${item.image}`}
                    alt=""
                    className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
            )}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-background/90 [mask-image:linear-gradient(to_top,black_55%,transparent)]" />

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
                    <h3 className="truncate text-xl font-semibold text-foreground sm:text-2xl">
                        {item.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 max-w-xl text-sm leading-5 text-muted-foreground">
                        {item.description}
                    </p>
                </div>
                <span className="grid size-10 shrink-0 place-items-center rounded-full border bg-background text-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                    <ArrowUpRight className="size-5" />
                </span>
            </div>
        </article>
    );
}

function SkillsSection() {
    return (
        <Section
            title="Tech stack yang dipakai"
            description="Teknologi yang kami gunakan untuk membangun website cepat, stabil, dan mudah dikembangkan."
        >
            <div className="relative h-24 overflow-hidden sm:h-28">
                <LogoLoop
                    logos={techLogos}
                    speed={70}
                    direction="left"
                    logoHeight={48}
                    gap={52}
                    hoverSpeed={0}
                    scaleOnHover
                    fadeOut
                    ariaLabel="Teknologi yang digunakan ForDev"
                />
            </div>
        </Section>
    );
}

function ServicesSection({ webServices }) {
    return (
        <Section
            title="Paket jasa web"
            description="Pilih paket dasar, lalu detail kebutuhan bisa dibahas lewat form penawaran."
        >
            <div className="grid gap-4 md:grid-cols-3">
                {webServices.map((item) => (
                    <Card key={item.id}>
                        <CardHeader>
                            <CardTitle>{item.name}</CardTitle>
                            <CardDescription>
                                {item.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">
                            Rp {Number(item.price).toLocaleString('id-ID')}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </Section>
    );
}

function TestimonialsSection({ testimonials }) {
    return (
        <Section title="Yang klien rasakan">
            <div className="grid gap-4 md:grid-cols-3">
                {testimonials.map((item) => (
                    <Card key={item.id}>
                        <CardHeader>
                            <CardTitle>{item.client_name}</CardTitle>
                            <CardDescription>
                                {item.client_role}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            “{item.content}”
                        </CardContent>
                    </Card>
                ))}
            </div>
        </Section>
    );
}
