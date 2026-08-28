import { Link } from '@inertiajs/react';
import { ArrowRight, Mail } from 'lucide-react';
import { IconCloud } from '@/components/public/icon-cloud';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/public-site';
import GradientWaves from '@/components/public/bg-hero';

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
        <section className="relative isolate mx-auto px-6 md:px-12 pb-14 pt-28 md:pt-0">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[100vh] min-h-[32rem] w-full overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(95,127,255,0.38),_rgba(149,181,255,0.18)_38%,_rgba(255,255,255,0)_70%)]">
                <div className="h-full w-full" style={{ filter: 'drop-shadow(0 0 28px rgba(95, 127, 255, 0.2))' }}>
                    <GradientWaves
                        horizonColor="#5F7FFF"
                        waveColor="#E6F0FF"
                        crestColor="#FFFFFF"
                        speed={0.38}
                        amplitude={2.2}
                        waveScale={0.58}
                        waveRatio={0.9}
                        swell={30}
                        turbulence={18}
                        tilt={1.08}
                        zoom={1.05}
                        height={5.4}
                        fogDepth={15}
                        detail="medium"
                        brightness={0.98}
                        opacity={0.96}
                        mouseInteraction
                        parallaxStrength={0.45}
                        grain
                        grainIntensity={0.04}
                    />
                </div>
            </div>

            <div className="relative z-10 min-h-[calc(100vh-5rem)] md:min-h-[42rem] md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-6">
                <div className="relative z-10 flex flex-col gap-6 md:max-w-[40rem]">
                    <div className="flex flex-col gap-4">
                        <h1 className="max-w-[10ch] text-balance font-heading text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                            {siteConfig.hero.title}
                        </h1>
                        <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                            {siteConfig.hero.description}
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button size="lg" asChild>
                            <Link href="/order" className=""><Mail data-icon="inline-start" />Contact</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/portofolio">View My Work <ArrowRight data-icon="inline-end" /></Link>
                        </Button>
                    </div>
                </div>

                <div className="pointer-events-none absolute right-0 top-24 z-20 w-[8rem] sm:w-[10rem] md:pointer-events-auto md:static md:w-[14rem] lg:w-[18rem]">
                    <div className="relative -mr-2 md:mr-0 md:translate-x-0 lg:-translate-x-2">
                        <IconCloud images={techIcons} showControl={false} />
                    </div>
                </div>
            </div>
        </section>
    );
}
