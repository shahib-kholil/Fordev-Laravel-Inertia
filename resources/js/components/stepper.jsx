import { Children, useState } from 'react';
import { motion } from 'motion/react';

const labels = ['Login / Register', 'Cart', 'Payment', 'Thank You'];

export default function Stepper({
    children,
    initialStep = 1,
    currentStep: controlledStep,
    onStepChange = () => {},
    onFinalStepCompleted = () => {},
    disableStepIndicators = false,
    stepCircleContainerClassName = '',
    stepContainerClassName = '',
    contentClassName = '',
    footerClassName = '',
    backButtonText = 'Back',
    nextButtonText = 'Continue',
    indicatorOnly = false,
    canNavigateToStep = () => true,
}) {
    const steps = Children.toArray(children);
    const [localStep, setLocalStep] = useState(initialStep);
    const currentStep = controlledStep ?? localStep;
    const total = steps.length;
    const completed = currentStep > total;
    const update = (step) => {
        if (controlledStep === undefined) setLocalStep(step);
        step > total ? onFinalStepCompleted() : onStepChange(step);
    };

    return (
        <div
            className={`w-full rounded-xl border bg-background ${stepCircleContainerClassName}`}
        >
            <div
                className={`flex w-full items-center p-3 sm:p-5 ${stepContainerClassName}`}
            >
                {labels.map((label, index) => {
                    const step = index + 1;
                    const active = currentStep === step;
                    const done = currentStep > step;
                    return (
                        <div
                            key={label}
                            className="flex min-w-0 flex-1 items-center"
                        >
                            <motion.button
                                type="button"
                                disabled={
                                    disableStepIndicators ||
                                    !canNavigateToStep(step, currentStep)
                                }
                                onClick={() =>
                                    canNavigateToStep(step, currentStep) &&
                                    update(step)
                                }
                                aria-current={active ? 'step' : undefined}
                                className={`flex min-w-0 items-center gap-2 text-left text-xs font-medium sm:text-sm ${disableStepIndicators || !canNavigateToStep(step, currentStep) ? 'cursor-default opacity-50' : 'cursor-pointer'}`}
                                animate={{ opacity: active || done ? 1 : 0.65 }}
                            >
                                <span
                                    className={`flex size-8 shrink-0 items-center justify-center rounded-full font-semibold ${active ? 'bg-primary text-primary-foreground' : done ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}
                                >
                                    {done ? '✓' : step}
                                </span>
                                <span
                                    className={`hidden truncate sm:inline ${active ? 'text-primary' : ''}`}
                                >
                                    {label}
                                </span>
                            </motion.button>
                            {step < labels.length && (
                                <span
                                    className={`mx-2 h-px flex-1 ${currentStep > step ? 'bg-primary' : 'bg-border'}`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
            {!indicatorOnly && !completed && (
                <div className={`space-y-4 px-5 pb-5 ${contentClassName}`}>
                    {steps[currentStep - 1]}
                    <div className={`flex justify-between ${footerClassName}`}>
                        <button
                            type="button"
                            disabled={currentStep === 1}
                            onClick={() => update(currentStep - 1)}
                        >
                            {backButtonText}
                        </button>
                        <button
                            type="button"
                            className="rounded-full bg-primary px-4 py-2 text-primary-foreground"
                            onClick={() =>
                                update(
                                    currentStep === total
                                        ? total + 1
                                        : currentStep + 1,
                                )
                            }
                        >
                            {currentStep === total
                                ? 'Complete'
                                : nextButtonText}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export function Step({ children }) {
    return <div>{children}</div>;
}

export { labels as stepLabels };
