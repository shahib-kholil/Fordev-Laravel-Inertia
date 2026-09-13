export default function ShaderBackdrop() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
            <div className="absolute top-1/2 left-1/2 size-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl sm:size-[34rem]" />
            <div className="hero-orbit absolute top-1/2 left-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-[45%] border-2 border-primary/50 shadow-[0_0_80px_color-mix(in_oklab,var(--primary)_45%,transparent)] sm:size-96" />
            <div className="hero-orbit-reverse absolute top-1/2 left-1/2 size-44 -translate-x-1/2 -translate-y-1/2 rounded-[45%] border border-secondary/60 sm:size-72" />
        </div>
    );
}
