import { ArrowRight, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import HeroSection from '@/components/public/hero-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PublicLayout from '@/layouts/public-layout';
import { siteConfig } from '@/config/public-site';

export default function Home({ webServices, portfolios, testimonials }) {
    return (
        <PublicLayout title="ForDev" description="Jasa pembuatan website, domain, portofolio, dan landing page.">
            <HeroSection />
            <ProjectsSection portfolios={portfolios} />
            <SkillsSection />
            <ServicesSection webServices={webServices} />
            <TestimonialsSection testimonials={testimonials} />
            <ContactSection />
        </PublicLayout>
    );
}

function Section({ eyebrow, title, description, children }) {
    return (
        <section className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:py-16">
            <div className="mx-auto flex max-w-2xl flex-col gap-3 text-center">
                <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
                <h2 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
                {description && <p className="text-muted-foreground">{description}</p>}
            </div>
            {children}
        </section>
    );
}

function ProjectsSection({ portfolios }) {
    return (
        <Section eyebrow="Selected work" title="Project yang sudah dikirim" description="Dari website profil sampai landing page campaign, semuanya dibuat rapi dan mudah dikelola.">
            <div className="grid gap-5 md:grid-cols-2">
                {portfolios.map((item) => <ProjectCard key={item.id} item={item} />)}
            </div>
        </Section>
    );
}

function ProjectCard({ item }) {
    return (
        <Card className="group overflow-hidden rounded-3xl transition duration-300 hover:-translate-y-1">
            <CardHeader>
                <div className="flex items-center justify-between gap-3">
                    <Badge variant="secondary">{item.category ?? 'Website'}</Badge>
                    <ExternalLink className="text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="aspect-video overflow-hidden rounded-2xl border bg-[linear-gradient(135deg,var(--muted),var(--background))] transition duration-500 group-hover:scale-[1.02]" />
                <div className="flex flex-col gap-2">
                    <CardTitle className="text-2xl">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                </div>
            </CardContent>
        </Card>
    );
}

function SkillsSection() {
    return (
        <Section eyebrow="Stack" title="Tech stack yang dipakai" description="Chip interaktif ringan, tanpa dependency physics dulu supaya tetap cepat.">
            <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-3">
                {siteConfig.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="rounded-full px-4 py-2 text-sm transition hover:-translate-y-0.5 hover:bg-accent">
                        {skill}
                    </Badge>
                ))}
            </div>
        </Section>
    );
}

function ServicesSection({ webServices }) {
    return (
        <Section eyebrow="Services" title="Paket jasa web" description="Pilih paket dasar, lalu detail kebutuhan bisa dibahas lewat form penawaran.">
            <div className="grid gap-4 md:grid-cols-3">
                {webServices.map((item) => (
                    <Card key={item.id}>
                        <CardHeader>
                            <CardTitle>{item.name}</CardTitle>
                            <CardDescription>{item.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">Rp {Number(item.price).toLocaleString('id-ID')}</CardContent>
                    </Card>
                ))}
            </div>
        </Section>
    );
}

function TestimonialsSection({ testimonials }) {
    return (
        <Section eyebrow="Clients" title="Yang klien rasakan">
            <div className="grid gap-4 md:grid-cols-3">
                {testimonials.map((item) => (
                    <Card key={item.id}>
                        <CardHeader>
                            <CardTitle>{item.client_name}</CardTitle>
                            <CardDescription>{item.client_role}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">“{item.content}”</CardContent>
                    </Card>
                ))}
            </div>
        </Section>
    );
}

function ContactSection() {
    const [copied, setCopied] = useState(false);

    async function copyEmail() {
        await navigator.clipboard.writeText(siteConfig.email);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <section className="px-4 py-12 sm:py-16">
            <Card className="mx-auto grid max-w-6xl gap-8 rounded-3xl p-2 md:grid-cols-[1fr_0.8fr] md:items-center">
                <CardHeader className="gap-4 p-6 sm:p-8">
                    <CardTitle className="font-heading text-4xl sm:text-5xl">Let’s connect</CardTitle>
                    <CardDescription className="text-base">Punya ide website, landing page, atau butuh domain? Kirim brief singkat, kami bantu rapikan arahnya.</CardDescription>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button size="lg" asChild><a href="/order">Contact</a></Button>
                        <Button size="lg" variant="outline" asChild><a href="/portofolio">See projects <ArrowRight data-icon="inline-end" /></a></Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                    <div className="flex flex-col gap-4 rounded-3xl border bg-background/70 p-5">
                        <p className="text-sm text-muted-foreground">Email</p>
                        <div className="flex items-center justify-between gap-3">
                            <span className="truncate font-medium">{siteConfig.email}</span>
                            <Button variant="outline" size="icon" onClick={copyEmail} aria-label="Copy email"><Copy /></Button>
                        </div>
                        <CardFooter className="px-0 pb-0 text-xs text-muted-foreground">{copied ? 'Email tersalin.' : 'One-click copy contact card.'}</CardFooter>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
