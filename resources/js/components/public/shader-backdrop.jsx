export default function ShaderBackdrop() {
    return (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,var(--primary)_0,transparent_18%),radial-gradient(circle_at_80%_20%,var(--muted)_0,transparent_20%),linear-gradient(180deg,var(--background),var(--background))] opacity-25" />
            <div className="absolute left-1/2 top-0 size-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.08]" />
        </div>
    );
}
