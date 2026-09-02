import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Copy, Menu } from 'lucide-react';
import { useState } from 'react';
import ShaderBackdrop from '@/components/public/shader-backdrop';
import ThemeToggle from '@/components/public/theme-toggle';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
} from '@/components/ui/sheet';
import { siteConfig } from '@/config/public-site';

export default function PublicLayout({ title, description, children }) {
    const { publicSettings = {} } = usePage().props;
    const metaDescription =
        description ?? 'ForDev jasa pembuatan website dan domain.';

    return (
        <>
            <Head title={title}>
                <meta name="description" content={metaDescription} />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary" />
            </Head>
            <div className="min-h-screen bg-white text-foreground dark:bg-background">
                <ShaderBackdrop />
                <header className="fixed inset-x-0 top-3 z-30 px-4">
                    <nav className="mx-auto flex max-w-2xl items-center justify-between rounded-full border border-foreground/20 bg-white/85 p-1.5 shadow-sm backdrop-blur dark:bg-background/80">
                        <Link
                            href="/"
                            className="bg-gradient-to-r from-primary to-secondary bg-clip-text px-3 text-sm font-semibold tracking-tight text-transparent hover:from-primary/80 hover:to-secondary/80"
                        >
                            For<span className="">Dev</span>
                        </Link>
                        <div className="hidden items-center gap-1 md:flex">
                            {siteConfig.nav.map(([label, href]) => (
                                <Button
                                    key={href}
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                >
                                    <Link href={href}>{label}</Link>
                                </Button>
                            ))}
                        </div>
                        <div className="flex items-center gap-1">
                            <ThemeToggle />
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="md:hidden"
                                        aria-label="Buka menu"
                                    >
                                        <Menu />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-72">
                                    <SheetHeader>
                                        <SheetTitle className="font-bold">
                                            Menu
                                        </SheetTitle>
                                        <SheetDescription className="sr-only">
                                            Navigasi utama website ForDev
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="mt-6 flex flex-col gap-2 px-4 font-medium text-foreground/90 dark:text-foreground/80">
                                        {siteConfig.nav.map(([label, href]) => (
                                            <Button
                                                key={href}
                                                variant="ghost"
                                                className="justify-start"
                                                asChild
                                            >
                                                <Link href={href}>{label}</Link>
                                            </Button>
                                        ))}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </nav>
                </header>
                <main className="pt-12 lg:pt-14">{children}</main>
                <ContactFooter email={publicSettings.contact_email} />
            </div>
        </>
    );
}

function ContactFooter({ email }) {
    const [copied, setCopied] = useState(false);
    const { url } = usePage();
    const secondary = url.startsWith('/domain')
        ? ['Cari domain', '/domain']
        : ['See projects', '/portofolio'];
    const contactEmail = email || siteConfig.email;

    async function copyEmail() {
        await navigator.clipboard.writeText(contactEmail);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <footer className="px-4 py-12 sm:py-16">
            <Card className="mx-auto grid max-w-6xl gap-8 rounded-3xl p-2 md:grid-cols-[1fr_0.8fr] md:items-center">
                <CardHeader className="gap-4 p-6 sm:p-8">
                    <CardTitle className="font-heading text-4xl sm:text-5xl">
                        Let’s connect
                    </CardTitle>
                    <CardDescription className="text-base">
                        Punya ide website, landing page, atau butuh domain?
                        Kirim brief singkat, kami bantu rapikan arahnya.
                    </CardDescription>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button size="lg" asChild>
                            <Link href="/order">Contact</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href={secondary[1]}>
                                {secondary[0]}{' '}
                                <ArrowRight data-icon="inline-end" />
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                    <div className="flex flex-col gap-4 rounded-3xl border bg-background/70 p-5">
                        <p className="text-sm text-muted-foreground">Email</p>
                        <div className="flex items-center justify-between gap-3">
                            <span className="truncate font-medium">
                                {contactEmail}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={copyEmail}
                                aria-label="Copy email"
                            >
                                <Copy />
                            </Button>
                        </div>
                        <CardFooter className="px-0 pb-0 text-xs text-muted-foreground">
                            {copied
                                ? 'Email tersalin.'
                                : 'One-click copy contact card.'}
                        </CardFooter>
                    </div>
                </CardContent>
            </Card>
        </footer>
    );
}
