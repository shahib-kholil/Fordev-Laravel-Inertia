import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import PublicLayout from '@/layouts/public-layout';

const statusLabels = {
    pending_confirmation: 'Menunggu pembayaran / verifikasi',
    paid: 'Pembayaran terverifikasi',
    registering: 'Sedang diproses',
    processing: 'Sedang diproses',
    active: 'Aktif',
    failed: 'Gagal diproses',
    api_error: 'Kendala pemrosesan',
    refund_needed: 'Perlu pengembalian dana',
    cancelled: 'Dibatalkan',
    expired: 'Kedaluwarsa',
};

export default function OrderStatus({
    order,
    orders = [],
    paymentMethods = [],
    paymentDetails = {},
    errors = {},
}) {
    const [editNotice, setEditNotice] = useState('');

    return (
        <PublicLayout title="Status Pesanan">
            <div className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:space-y-6 sm:py-12">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Status pesanan
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                        <h1 className="text-2xl font-semibold tracking-tight break-words text-primary sm:text-3xl">
                            {order?.order_number ?? 'Pesanan Anda'}
                        </h1>
                        {order?.order_number && (
                            <CopyOrderNumber value={order.order_number} />
                        )}
                    </div>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                        Pantau pembayaran dan pemrosesan pesanan di sini.
                        Pembayaran terverifikasi tidak berarti domain langsung
                        aktif.
                    </p>
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
                                {statusLabels[order.status] ??
                                    'Status belum tersedia'}
                            </span>
                            {!order.items?.length && (
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
                            )}
                        </div>
                        {editNotice && (
                            <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                                {editNotice}
                            </p>
                        )}
                        <OrderProgress status={order.status} />
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
                                            {statusLabels[item.status] ??
                                                'Status belum tersedia'}
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
                        </div>
                        <PriceBreakdown order={order} />
                        {errors.payment && (
                            <p
                                role="alert"
                                className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"
                            >
                                {errors.payment}
                            </p>
                        )}
                        {order.status === 'pending_confirmation' && (
                            <PaymentSelector
                                orderNumber={order.order_number}
                                total={order.total_snapshot}
                                paymentDetails={paymentDetails}
                                paymentMethods={paymentMethods}
                                selectedMethod={
                                    order.payments?.find(
                                        (payment) =>
                                            payment.status === 'pending',
                                    )?.provider === 'manual'
                                        ? 'manual'
                                        : 'borderpay'
                                }
                            />
                        )}
                        {order.status === 'pending_confirmation' &&
                            order.payments?.some(
                                (payment) =>
                                    payment.provider === 'borderpay' &&
                                    payment.status === 'pending',
                            ) && (
                                <form
                                    method="post"
                                    action={`/order/${encodeURIComponent(order.order_number)}/payment/sync`}
                                >
                                    <input
                                        type="hidden"
                                        name="_token"
                                        value={
                                            document.querySelector(
                                                'meta[name="csrf-token"]',
                                            )?.content ?? ''
                                        }
                                    />
                                    <button
                                        type="submit"
                                        className="w-full rounded-xl border border-primary/40 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
                                    >
                                        Cek status pembayaran
                                    </button>
                                </form>
                            )}
                        {['failed', 'api_error', 'refund_needed'].includes(
                            order.status,
                        ) && (
                            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
                                Pendaftaran domain mengalami kendala saat data
                                dikirim ke registrar. Tim ForDev sudah menerima
                                informasinya dan akan memeriksa pesanan ini.
                                Kamu tidak perlu membuat pesanan baru; kami akan
                                menghubungi kamu jika diperlukan.
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

function OrderProgress({ status }) {
    const active =
        status === 'active'
            ? 3
            : ['paid', 'processing', 'registering'].includes(status)
              ? 2
              : status === 'pending_confirmation'
                ? 1
                : 0;
    const steps = [
        ['Dibuat', 'Pesanan diterima'],
        ['Pembayaran', 'Pembayaran dan verifikasi'],
        ['Pemrosesan', 'Pendaftaran / pengerjaan pesanan'],
        ['Aktif', 'Setelah pemrosesan berhasil'],
    ];

    return (
        <div className="grid grid-cols-1 gap-3 border-y py-4 sm:grid-cols-4 sm:gap-2">
            {steps.map(([label, description], index) => (
                <div
                    key={label}
                    className="flex min-w-0 items-start gap-2 text-xs font-semibold sm:flex-col sm:items-center sm:text-center"
                >
                    <span
                        className={`flex size-6 items-center justify-center rounded-full ${index <= active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                    >
                        {index < active ? '✓' : index + 1}
                    </span>
                    <span
                        className={
                            index <= active
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                        }
                    >
                        <span className="block">{label}</span>
                        <span className="mt-0.5 block leading-4 font-normal text-muted-foreground">
                            {description}
                        </span>
                    </span>
                </div>
            ))}
        </div>
    );
}

function PriceBreakdown({ order }) {
    const rows = [
        ['Harga domain', order.domain_price_snapshot],
        [
            'Diskon',
            order.domain_discount_snapshot
                ? -order.domain_discount_snapshot
                : null,
        ],
        ['Pajak', order.tax_snapshot],
    ].filter(
        ([, value]) =>
            value !== null && value !== undefined && Number(value) !== 0,
    );

    return (
        <div className="space-y-2 border-t pt-4 text-sm">
            {rows.map(([label, value]) => (
                <div
                    key={label}
                    className="flex justify-between gap-4 text-muted-foreground"
                >
                    <span>{label}</span>
                    <span>Rp {Number(value).toLocaleString('id-ID')}</span>
                </div>
            ))}
            <div className="flex justify-between gap-4 border-t pt-2 font-semibold">
                <span>Total pembayaran</span>
                <span>
                    Rp{' '}
                    {Number(order.total_snapshot ?? 0).toLocaleString('id-ID')}
                </span>
            </div>
        </div>
    );
}

function PaymentSelector({
    orderNumber,
    total,
    paymentDetails,
    paymentMethods,
    selectedMethod,
}) {
    const [method, setMethod] = useState(selectedMethod ?? 'manual');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    async function selectMethod(value) {
        if (method === value) {
            setMethod(null);

            return;
        }

        setMethod(value);
        setError('');

        if (value !== 'manual') {
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(
                `/order/${encodeURIComponent(orderNumber)}/payment`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-CSRF-TOKEN':
                            document.querySelector('meta[name="csrf-token"]')
                                ?.content ?? '',
                    },
                    body: new URLSearchParams({ payment_method: value }),
                },
            );

            if (!response.ok) {
                throw new Error('Payment request failed');
            }
        } catch {
            setError(
                'Pilihan manual belum tersimpan. Periksa koneksi, lalu pilih Manual lagi sebelum transfer.',
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-4 border-t pt-5">
            <div>
                <p className="text-base font-semibold">Metode Pembayaran</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Pilih metode pembayaran yang ingin digunakan.
                </p>
            </div>
            <div className="divide-y overflow-hidden rounded-xl border">
                {[
                    ['manual', 'Transfer Manual', 'Tanpa biaya layanan'],
                    [
                        'borderpay',
                        'Pembayaran otomatis',
                        'QRIS, virtual account, e-wallet',
                    ],
                ].map(([value, label, caption]) => (
                    <div key={value}>
                        <button
                            type="button"
                            onClick={() => selectMethod(value)}
                            aria-expanded={method === value}
                            aria-controls={`payment-detail-${value}`}
                            disabled={saving}
                            className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-60"
                        >
                            <span
                                aria-hidden="true"
                                className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${method === value ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/50'}`}
                            >
                                {method === value && (
                                    <Check className="size-3" />
                                )}
                            </span>
                            <span className="flex-1">
                                <span className="block text-sm font-semibold">
                                    {label}
                                </span>
                                <span className="mt-1 block text-xs text-muted-foreground">
                                    {caption}
                                </span>
                            </span>
                            <span
                                aria-hidden="true"
                                className="text-muted-foreground"
                            >
                                {method === value ? '−' : '+'}
                            </span>
                        </button>
                        <div
                            id={`payment-detail-${value}`}
                            hidden={method !== value}
                            className="px-4 pb-4 sm:pl-12"
                        >
                            {value === 'manual' ? (
                                <ManualInstructions
                                    details={paymentDetails}
                                    methods={paymentMethods}
                                    total={total}
                                />
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        Pilih channel pembayaran di BorderPay.
                                        Biaya akan terlihat sebelum membayar dan
                                        status diperbarui otomatis.
                                    </p>
                                    <PaymentChannel
                                        orderNumber={orderNumber}
                                        label="Lanjut ke BorderPay"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {error && (
                <p
                    role="alert"
                    className="text-sm text-red-700 dark:text-red-300"
                >
                    {error}
                </p>
            )}
            {saving && (
                <p role="status" className="text-sm text-muted-foreground">
                    Menyimpan pilihan manual…
                </p>
            )}
        </div>
    );
}

function PaymentChannel({ orderNumber, label }) {
    return (
        <form
            method="post"
            action={`/order/${encodeURIComponent(orderNumber)}/payment`}
        >
            <input
                type="hidden"
                name="_token"
                value={
                    document.querySelector('meta[name="csrf-token"]')
                        ?.content ?? ''
                }
            />
            <input type="hidden" name="payment_method" value="borderpay" />
            <button
                type="submit"
                className="w-full rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
                {label}
            </button>
        </form>
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
                <>
                    <Check className="size-4" />
                    <span>Disalin</span>
                </>
            ) : (
                <Copy className="size-4" />
            )}
        </button>
    );
}

function ManualInstructions({ methods = [], details = {}, total }) {
    const [copiedMethod, setCopiedMethod] = useState('');
    const labels = {
        bank_transfer: 'Transfer rekening',
        dana: 'DANA',
        qris: 'QRIS',
    };

    const [copyError, setCopyError] = useState('');

    async function copyDetail(method, value) {
        setCopyError('');

        try {
            await navigator.clipboard.writeText(value);
            setCopiedMethod(method);
            window.setTimeout(() => setCopiedMethod(''), 1500);
        } catch {
            setCopyError(
                'Gagal menyalin. Silakan salin detail pembayaran secara manual.',
            );
        }
    }
    const enabled = methods.filter((method) => Object.hasOwn(labels, method));

    return (
        <div className="space-y-4 text-sm">
            {enabled.length === 0 && (
                <p className="text-muted-foreground">
                    Metode pembayaran manual belum tersedia.
                </p>
            )}
            {enabled.map((method) => {
                const value = details?.[method];
                const image =
                    method === 'qris' && value
                        ? /^https?:\/\//i.test(value)
                            ? value
                            : `/storage/${value.replace(/^\/+/, '')}`
                        : null;

                return (
                    <div key={method} className="rounded-lg bg-muted/40 p-4">
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <p className="font-semibold">{labels[method]}</p>
                            {method !== 'qris' && value && (
                                <button
                                    type="button"
                                    onClick={() => copyDetail(method, value)}
                                    aria-label={`Salin detail ${labels[method]}`}
                                    className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-xs font-medium text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary"
                                >
                                    {copiedMethod === method ? (
                                        <Check className="size-4" />
                                    ) : (
                                        <Copy className="size-4" />
                                    )}
                                    <span aria-live="polite">
                                        {copiedMethod === method
                                            ? 'Tersalin'
                                            : 'Salin'}
                                    </span>
                                </button>
                            )}
                        </div>
                        {image ? (
                            <a
                                href={image}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block"
                            >
                                <img
                                    src={image}
                                    alt="QRIS pembayaran manual ForDev"
                                    className="max-h-56 max-w-full rounded-lg bg-white p-2"
                                />
                                <span className="mt-2 block text-xs text-primary">
                                    Buka gambar QRIS
                                </span>
                            </a>
                        ) : (
                            <p className="break-words whitespace-pre-line">
                                {value ||
                                    'Detail pembayaran belum diatur oleh admin.'}
                            </p>
                        )}
                    </div>
                );
            })}
            {copyError && (
                <p
                    role="alert"
                    className="text-xs text-red-600 dark:text-red-300"
                >
                    {copyError}
                </p>
            )}
            {enabled.length > 0 && (
                <div className="border-t pt-3">
                    <p className="text-xs text-muted-foreground">
                        Nominal pembayaran
                    </p>
                    <p className="mt-1 text-xl font-semibold tabular-nums">
                        Rp {Number(total ?? 0).toLocaleString('id-ID')}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        Gunakan salah satu metode di atas. Pembayaran
                        diverifikasi admin sebelum pesanan diproses.
                    </p>
                </div>
            )}
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
                                {statusLabels[previousOrder.status] ??
                                    'Status belum tersedia'}
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
