import PublicLayout from '@/layouts/public-layout';
import { Check, Copy, Landmark, QrCode, WalletCards } from 'lucide-react';
import { useState } from 'react';

export default function OrderStatus({
    order,
    orders = [],
    paymentMethods = [],
    paymentDetails = {},
}) {
    const [editNotice, setEditNotice] = useState('');
    return (
        <PublicLayout title="Status Pesanan">
            <div className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:space-y-6 sm:py-12">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        Pembelian Domain
                    </h1>
                    <div className="mt-2 flex items-center gap-2">
                        <p className="text-lg font-semibold break-words text-primary sm:text-xl">
                            {order?.order_number ?? 'Memuat pesanan...'}
                        </p>
                        {order?.order_number && (
                            <CopyOrderNumber value={order.order_number} />
                        )}
                    </div>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                        Pesanan berhasil dibuat. Silakan lakukan pembayaran
                        menggunakan salah satu metode pembayaran yang tersedia.
                    </p>
                    {order && (
                        <PaymentDetails
                            methods={paymentMethods}
                            details={paymentDetails}
                        />
                    )}
                </div>
                {!order ? (
                    <PreviousOrders orders={orders} />
                ) : (
                    <div className="space-y-6 rounded-3xl border bg-card p-4 shadow-sm sm:p-6">
                        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                Status saat ini
                            </span>
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary capitalize">
                                {order.status.replaceAll('_', ' ')}
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    order.status === 'pending_confirmation'
                                        ? window.location.assign(
                                              `/order?edit=${encodeURIComponent(order.order_number)}`,
                                          )
                                        : setEditNotice(
                                              'Pesanan ini sudah diproses dan tidak dapat diedit lagi.',
                                          )
                                }
                                className={
                                    order.status === 'pending_confirmation'
                                        ? 'rounded-lg border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10'
                                        : 'cursor-not-allowed rounded-lg border px-3 py-1.5 text-xs font-semibold text-muted-foreground opacity-60'
                                }
                            >
                                Edit Pesanan
                            </button>
                        </div>
                        {editNotice && (
                            <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                                {editNotice}
                            </p>
                        )}
                        {order.items?.length > 0 && (
                            <div className="space-y-2 border-t pt-4">
                                <p className="text-sm font-semibold">
                                    Domain dalam paket
                                </p>
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex justify-between gap-3 rounded-lg border p-3 text-sm"
                                    >
                                        <span>
                                            {item.domain_name}
                                            {item.extension}
                                        </span>
                                        <span className="capitalize">
                                            {item.status.replaceAll('_', ' ')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="grid gap-4 sm:grid-cols-2">
                            {(!order.items || order.items.length === 0) && (
                                <div>
                                    <p className="text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                        Domain
                                    </p>
                                    <p className="mt-1 text-lg font-semibold">
                                        {order.domain_name}
                                        {order.domain?.extension ?? ''}
                                    </p>
                                </div>
                            )}
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
                        {['failed', 'api_error', 'refund_needed'].includes(
                            order.status,
                        ) && (
                            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
                                Pendaftaran domain belum berhasil. Tim ForDev
                                akan memeriksa pesanan ini dan menghubungi kamu
                                jika diperlukan.
                            </div>
                        )}
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

function CopyOrderNumber({ value }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            type="button"
            aria-label="Salin nomor pesanan"
            onClick={() => {
                navigator.clipboard.writeText(value);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
            }}
            className="text-primary"
            title="Salin nomor pesanan"
        >
            {copied ? (
                <Check className="size-4" />
            ) : (
                <Copy className="size-4" />
            )}
        </button>
    );
}

function PaymentDetails({ methods, details }) {
    const [selectedMethod, setSelectedMethod] = useState('');
    const [copiedPayment, setCopiedPayment] = useState('');

    function copyPayment(method, value) {
        const number = value
            ?.match(/[0-9][0-9 .-]{5,}[0-9]/)?.[0]
            ?.replace(/[ .-]/g, '');
        if (!number) return;
        navigator.clipboard.writeText(number);
        setCopiedPayment(method);
        setTimeout(() => setCopiedPayment(''), 1500);
    }
    if (!methods.length) return null;
    const labels = {
        qris: 'QRIS',
        dana: 'DANA',
        bank_transfer: 'Transfer Rekening',
    };

    return (
        <div className="border-t pt-5">
            <p className="font-semibold">Pilih metode pembayaran</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {methods.map((method) => {
                    const value = details[method];
                    const selected = selectedMethod === method;
                    const url =
                        method === 'qris' && value
                            ? value.startsWith('http')
                                ? value
                                : `/storage/${value}`
                            : null;
                    return (
                        <button
                            key={method}
                            type="button"
                            onClick={() =>
                                setSelectedMethod(selected ? '' : method)
                            }
                            className={`w-full rounded-2xl border p-4 text-left transition-[background-color,box-shadow] duration-300 ${selected ? 'border-primary bg-primary/5 shadow-sm' : 'hover:bg-muted/40'}`}
                        >
                            <div className="flex items-center gap-3">
                                {method === 'qris' ? (
                                    <QrCode className="size-5 text-primary" />
                                ) : method === 'dana' ? (
                                    <WalletCards className="size-5 text-primary" />
                                ) : (
                                    <Landmark className="size-5 text-primary" />
                                )}
                                <span className="font-semibold">
                                    {labels[method] ?? method}
                                </span>
                                <span className="ml-auto rounded-full border p-1">
                                    {selected && (
                                        <Check className="size-3 text-primary" />
                                    )}
                                </span>
                            </div>
                            <span
                                className={`grid transition-[grid-template-rows,opacity] duration-300 ${selected ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                            >
                                <span className="min-h-0 overflow-hidden">
                                    {url ? (
                                        <img
                                            src={url}
                                            alt="QRIS"
                                            className="max-h-48 rounded-lg bg-white p-2"
                                        />
                                    ) : (
                                        <span className="block text-sm whitespace-pre-line text-slate-600 dark:text-slate-300">
                                            {value ||
                                                'Detail pembayaran belum tersedia.'}
                                        </span>
                                    )}
                                    {!url &&
                                        value &&
                                        (method === 'dana' ||
                                            method === 'bank_transfer') && (
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    copyPayment(method, value);
                                                }}
                                                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                                            >
                                                {copiedPayment === method ? (
                                                    <Check className="size-3" />
                                                ) : (
                                                    <Copy className="size-3" />
                                                )}
                                                {copiedPayment === method
                                                    ? 'Nomor tersalin'
                                                    : 'Salin nomor'}
                                            </button>
                                        )}
                                    {url && (
                                        <a
                                            href={url}
                                            download
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={(event) =>
                                                event.stopPropagation()
                                            }
                                            className="mt-3 inline-flex rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                                        >
                                            Download QRIS
                                        </a>
                                    )}
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function PreviousOrders({ orders }) {
    return (
        <div className="space-y-4 rounded-2xl border p-6">
            <div>
                <h2 className="font-semibold">Pesanan sebelumnya</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Pilih pesanan untuk melihat detail dan status pembayarannya.
                </p>
            </div>
            {orders.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                    Belum ada pesanan sebelumnya.
                </p>
            ) : (
                orders.map((previousOrder) => (
                    <a
                        key={previousOrder.order_number}
                        href={`/cek-status-pesanan?order=${encodeURIComponent(previousOrder.order_number)}`}
                        className="flex items-center justify-between gap-3 rounded-xl border p-3 text-sm transition hover:border-primary/50"
                    >
                        <span>
                            <strong className="block text-primary">
                                {previousOrder.order_number}
                            </strong>
                            <span className="text-slate-600 capitalize dark:text-slate-300">
                                {previousOrder.status.replaceAll('_', ' ')}
                            </span>
                        </span>
                        <span className="font-semibold">
                            Rp{' '}
                            {Number(
                                previousOrder.total_snapshot ?? 0,
                            ).toLocaleString('id-ID')}
                        </span>
                    </a>
                ))
            )}
        </div>
    );
}
