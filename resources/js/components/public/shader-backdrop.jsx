export default function ShaderBackdrop() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-white dark:bg-background"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_8%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_28%),radial-gradient(circle_at_82%_18%,color-mix(in_oklab,var(--secondary)_14%,transparent),transparent_30%),linear-gradient(180deg,#fff,#fff)] dark:bg-[radial-gradient(circle_at_20%_10%,var(--primary)_0,transparent_18%),radial-gradient(circle_at_80%_20%,var(--muted)_0,transparent_20%),linear-gradient(180deg,var(--background),var(--background))] dark:opacity-25" />
            <div className="absolute top-0 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl dark:bg-primary/10" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.08]" />
        </div>
    );
}
