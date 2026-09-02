import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';

export default function ThemeToggle() {
    return (
        <AnimatedThemeToggler
            variant="circle"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="Ganti tema"
        />
    );
}
