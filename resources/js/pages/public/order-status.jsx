import PublicLayout from '@/layouts/public-layout';
import { useState } from 'react';
import Stepper from '@/components/stepper';

export default function OrderStatus({ order, paymentDetails = {} }) {
    const [step, setStep] = useState(4);

    return (
        <PublicLayout title="Status Pesanan">
            <div className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:space-y-6 sm:py-12">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        Pembelian Domain
                    </h1>
                    <p className="mt-2 text-lg font-semibold break-words text-primary sm:text-xl">
                        {order?.order_number ?? 'Memuat pesanan...'}
                    </p>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                        Status diperbarui otomatis, kamu tidak perlu melakukan
                        pengecekan manual.
                    </p>
                </div>
                <Stepper
                    currentStep={step}
                    onStepChange={setStep}
                    indicatorOnly
                />
                {!order ? (
                    <LoadingCard />
                ) : (
                    <div className="space-y-6 rounded-3xl border bg-card p-4 shadow-sm sm:p-6">
                        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                Status saat ini
                            </span>
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary capitalize">
                                {order.status.replaceAll('_', ' ')}
                            </span>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                    Domain
                                </p>
                                <p className="mt-1 text-lg font-semibold">
                                    {order.domain_name}
                                    {order.domain?.extension ?? ''}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                    Total
                                </p>
                                <p className="mt-1 text-lg font-semibold">
                                    Rp{' '}
                                    {Number(
                                        order.total_snapshot ?? 0,
                                    ).toLocaleString('id-ID')}
                                </p>
                            </div>
                        </div>
                        <PaymentDetails
                            method={order.payment_method}
                            details={paymentDetails}
                        />
                        {order.admin_notes && (
                            <div className="rounded-xl bg-muted/50 p-4 text-sm">
                                {order.admin_notes}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}

function PaymentDetails({ method, details }) {
    if (!method) return null;
    const labels = {
        qris: 'QRIS',
        dana: 'DANA',
        bank_transfer: 'Transfer Rekening',
    };
    const value = details[method];
    const url =
        method === 'qris' && value
            ? value.startsWith('http')
                ? value
                : `/storage/${value}`
            : null;

    return (
        <div className="border-t pt-5">
            <p className="text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Metode pembayaran
            </p>
            <p className="mt-1 text-lg font-semibold">
                {labels[method] ?? method}
            </p>
            {url ? (
                <>
                    <img
                        src={url}
                        alt="QRIS"
                        className="mt-3 max-h-48 rounded-lg bg-white p-2"
                    />
                    <a
                        href={url}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                    >
                        Download QRIS
                    </a>
                </>
            ) : value ? (
                <p className="mt-1 whitespace-pre-line text-slate-600 dark:text-slate-300">
                    {value}
                </p>
            ) : null}
        </div>
    );
}

function LoadingCard() {
    return (
        <div className="space-y-5 rounded-2xl border p-6">
            <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-20 animate-pulse rounded-xl bg-muted" />
            <div className="h-32 animate-pulse rounded-xl bg-muted" />
        </div>
    );
}
