export function AdminPageShell({
    eyebrow = 'Admin',
    title,
    description,
    actions,
    children,
}) {
    return (
        <div className="flex flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col gap-1.5">
                    <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                        {eyebrow}
                    </p>
                    <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                        {title}
                    </h1>
                    {description && (
                        <p className="max-w-2xl text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                {actions && (
                    <div className="flex items-center gap-2">{actions}</div>
                )}
            </div>
            {children}
        </div>
    );
}
