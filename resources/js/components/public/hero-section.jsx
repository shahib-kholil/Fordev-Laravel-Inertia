import { Link } from '@inertiajs/react';
import { ArrowRight, Mail } from 'lucide-react';
import { IconCloud } from '@/components/public/icon-cloud';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/public-site';
import LightRays from '@/components/public/bg-hero';
import ShinyText from '@/components/public/Font-Hero';

const techIcons = [
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
];

export default function HeroSection() {
    return (
        <section className="relative isolate mx-auto overflow-hidden bg-white px-6 md:px-12 dark:bg-background">
            <div className="pointer-events-none absolute inset-0 z-0 opacity-45 mix-blend-screen dark:opacity-100">
                <div className="z-0 h-full w-full">
                    <LightRays
                        raysOrigin="top-center"
                        raysColor="#7ca7ff"
                        raysSpeed={1}
                        lightSpread={0.5}
                        rayLength={3}
                        followMouse={true}
                        mouseInfluence={0.1}
                        noiseAmount={0}
                        distortion={0}
                        className="custom-rays"
                        pulsating={false}
                        fadeDistance={1}
                        saturation={1}
                    />
                </div>
            </div>

            <div className="relative z-10 flex min-h-[calc(100svh-3rem)] items-center py-16 sm:py-20 md:grid md:min-h-[calc(100svh-3.5rem)] md:grid-cols-[minmax(0,1fr)_auto] md:gap-6">
                <div className="relative z-10 flex flex-col gap-6 md:max-w-[40rem]">
                    <div className="flex flex-col gap-4">
                        <ShinyText
                            text={siteConfig.hero.title}
                            speed={2}
                            delay={0}
                            lightColor="#1a49d5"
                            darkColor="#e2e8f0"
                            lightShineColor="#dfe7ff"
                            darkShineColor="#3a79ee"
                            spread={120}
                            direction="left"
                            yoyo={false}
                            pauseOnHover={true}
                            disabled={false}
                            className="block max-w-[10ch] font-heading text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl"
                        />
                        <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                            {siteConfig.hero.description}
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button size="lg" asChild>
                            <Link href="/order" className="">
                                <Mail data-icon="inline-start" />
                                Contact
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/portofolio">
                                View My Work{' '}
                                <ArrowRight data-icon="inline-end" />
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="pointer-events-none absolute top-10 right-0 z-30 w-[8rem] sm:top-12 sm:w-[10rem] md:pointer-events-auto md:static md:w-[18rem] lg:w-[22rem] xl:w-[26rem]">
                    <div className="relative -mr-2 md:mr-0 md:translate-x-0 lg:-translate-x-2">
                        <IconCloud
                            images={techIcons}
                            showControl={false}
                            className="w-full"
                            canvasClassName="max-h-[22rem] md:max-h-[28rem] lg:max-h-[30rem]"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
