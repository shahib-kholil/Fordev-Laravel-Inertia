import { Head, Link, usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import ShaderBackdrop from '@/components/public/shader-backdrop';
import ThemeToggle from '@/components/public/theme-toggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { siteConfig } from '@/config/public-site';

export default function PublicLayout({ title, description, children }) {
    const { publicSettings = {} } = usePage().props;
    const metaDescription = description ?? 'ForDev jasa pembuatan website dan domain.';

    return (
        <>
            <Head title={title}>
                <meta name="description" content={metaDescription} />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary" />
            </Head>
            <div className="min-h-screen bg-background text-foreground">
                <ShaderBackdrop />
                <header className="fixed inset-x-0 top-3 z-30 px-4">
                    <nav className="mx-auto flex max-w-2xl items-center justify-between rounded-full border bg-background/80 p-1.5 shadow-sm backdrop-blur">
                        <Link href="/" className="px-3 text-sm font-semibold tracking-tight">
                            For<span className="text-muted-foreground">Dev</span>
                        </Link>
                        <div className="hidden items-center gap-1 md:flex">
                            {siteConfig.nav.map(([label, href]) => (
                                <Button key={href} variant="ghost" size="sm" asChild>
                                    <Link href={href}>{label}</Link>
                                </Button>
                            ))}
                        </div>
                        <div className="flex items-center gap-1">
                            <ThemeToggle />
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="icon" className="md:hidden" aria-label="Buka menu">
                                        <Menu />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-72">
                                    <SheetHeader><SheetTitle>Menu ForDev</SheetTitle></SheetHeader>
                                    <div className="mt-6 flex flex-col gap-2">
                                        {siteConfig.nav.map(([label, href]) => (
                                            <Button key={href} variant="ghost" className="justify-start" asChild>
                                                <Link href={href}>{label}</Link>
                                            </Button>
                                        ))}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </nav>
                </header>
                <main>{children}</main>
                <footer className="px-4 py-10">
                    <div className="mx-auto grid max-w-6xl gap-6 rounded-3xl border bg-card/80 p-6 text-sm text-muted-foreground backdrop-blur md:grid-cols-3">
                        <div>
                            <b className="text-foreground">ForDev</b>
                            <p>Website cepat, rapi, siap jualan.</p>
                        </div>
                        <p>{publicSettings.contact_email}</p>
                        <p>{publicSettings.contact_whatsapp}<br />{publicSettings.contact_address}</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
