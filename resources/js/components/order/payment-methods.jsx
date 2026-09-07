import { Check, Copy } from 'lucide-react';

const methods = [
    ['qris', 'QRIS'],
    ['dana', 'DANA'],
    ['bank_transfer', 'Transfer Rekening'],
];

export default function PaymentMethods({
    availableMethods,
    value,
    details,
    copiedPayment,
    onChange,
    onCopy,
}) {
    return (
        <div className="space-y-4 rounded-xl border bg-card p-5">
            <div>
                <p className="font-medium">Pilih metode pembayaran</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Pilih salah satu metode pembayaran yang tersedia.
                </p>
            </div>
            <div className="flex min-w-0 flex-col gap-3 pb-1 sm:flex-row">
                {methods
                    .filter(([method]) => availableMethods.includes(method))
                    .map(([method, label]) => (
                        <PaymentMethod
                            key={method}
                            method={method}
                            label={label}
                            selected={value === method}
                            detail={details[method]}
                            copied={copiedPayment === method}
                            onChange={onChange}
                            onCopy={onCopy}
                        />
                    ))}
            </div>
        </div>
    );
}

function PaymentMethod({
    method,
    label,
    selected,
    detail,
    copied,
    onChange,
    onCopy,
}) {
    const detailUrl = detail?.startsWith('http')
        ? detail
        : `/storage/${detail}`;

    return (
        <button
            type="button"
            onClick={() => onChange(method)}
            className={`min-w-0 flex-1 rounded-3xl border p-4 text-left transition-[flex,background-color,color,box-shadow] duration-500 ease-out sm:p-5 ${selected ? 'bg-primary text-primary-foreground shadow-lg sm:flex-[2]' : 'bg-card text-card-foreground hover:bg-accent'}`}
        >
            <span className="font-medium">{label}</span>
            {selected && (
                <span className="mt-1 block text-xs text-primary-foreground/90">
                    {method === 'qris' && detail ? (
                        <>
                            <img
                                src={detailUrl}
                                alt="QRIS"
                                className="mt-3 max-h-48 rounded-lg bg-white p-2"
                            />
                            <a
                                href={detailUrl}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-sm hover:bg-slate-100"
                            >
                                Download QRIS
                            </a>
                        </>
                    ) : (
                        detail || 'Pembayaran manual'
                    )}
                </span>
            )}
            {selected &&
                ['dana', 'bank_transfer'].includes(method) &&
                detail && (
                    <span
                        role="button"
                        tabIndex={0}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary-foreground"
                        onClick={(event) => {
                            event.stopPropagation();
                            onCopy(detail, method);
                        }}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                event.stopPropagation();
                                onCopy(detail, method);
                            }
                        }}
                    >
                        {copied ? (
                            <Check className="size-3" />
                        ) : (
                            <Copy className="size-3" />
                        )}
                        {copied ? 'Tersalin' : 'Salin'}
                    </span>
                )}
        </button>
    );
}
