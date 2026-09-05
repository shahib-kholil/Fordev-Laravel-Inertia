const steps = ['Login / Register', 'Cart', 'Payment', 'Thank You'];

export default function CheckoutSteps({ currentStep = 1, loading = false }) {
    return (
        <div className="grid grid-cols-4 overflow-hidden rounded-xl border bg-background text-xs font-medium sm:text-sm">
            {steps.map((step, index) => {
                const active = index === currentStep;
                const completed = index < currentStep;

                return (
                    <div
                        key={step}
                        className={`flex min-h-16 items-center justify-center gap-2 px-2 py-3 text-center ${active ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}
                    >
                        <span
                            className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs ${active ? 'bg-primary-foreground/20' : completed ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}
                        >
                            {index + 1}
                        </span>
                        <span className="hidden sm:inline">
                            {loading && active ? 'Memproses...' : step}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
/**
 * currentStep: 0 login/register, 1 cart, 2 payment, 3 thank you.
 */
