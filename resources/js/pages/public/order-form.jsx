import { useForm } from '@inertiajs/react';
import { AlertCircle, Check, Copy } from 'lucide-react';
import { useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import PublicLayout from '@/layouts/public-layout';
import Stepper from '@/components/stepper';

export default function OrderForm({
    webServices,
    domains,
    defaults = {},
    buyer,
    pendingOrder,
    paymentMethods = ['qris', 'dana', 'bank_transfer'],
    paymentDetails = {},
}) {
    const [checkoutStep, setCheckoutStep] = useState(2);
    const [cartNotice, setCartNotice] = useState('');
    const [invalidField, setInvalidField] = useState('');
    const [copiedPayment, setCopiedPayment] = useState('');
    const phoneRef = useRef(null);
    const domainNameRef = useRef(null);
    const domainIdRef = useRef(null);
    const { data, setData, post, processing, errors } = useForm({
        client_phone: '',
        order_type: defaults.order_type ?? 'website',
        web_service_id: '',
        domain_id: defaults.domain_id ?? '',
        domain_name: defaults.domain_name ?? '',
        notes: '',
        website_url: '',
        payment_method: '',
        confirm_new_order: false,
    });
    const paymentComplete = Boolean(data.payment_method);

    async function copyPayment(value, method) {
        if (!value) return;
        const copiedValue =
            method === 'bank_transfer'
                ? (value.match(/\d{6,}/)?.[0] ?? value)
                : value;
        await navigator.clipboard.writeText(copiedValue);
        setCopiedPayment(method);
        setTimeout(() => setCopiedPayment(''), 1500);
    }
    const needsWeb = ['website', 'both'].includes(data.order_type);
    const needsDomain = ['domain', 'both'].includes(data.order_type);
    const selectedDomain = domains.find(
        (item) => String(item.id) === String(data.domain_id),
    );
    const isDomainCheckout = data.order_type === 'domain' && selectedDomain;
    const phoneValid = /^[0-9+()\s-]{8,30}$/.test(data.client_phone.trim());
    const cartComplete = Boolean(
        phoneValid &&
        data.client_phone.trim() &&
        data.domain_name.trim() &&
        data.domain_id,
    );
    const canNavigateToStep = (target, current) =>
        target <= current ||
        (target === 3 && cartComplete) ||
        (target === 4 && cartComplete && paymentComplete);

    function submit(e) {
        e.preventDefault();
        if (!cartComplete) {
            setCheckoutStep(2);
            return;
        }
        post('/order');
    }

    function nextStep() {
        if (checkoutStep === 3 && !paymentComplete) {
            setCartNotice('Pilih metode pembayaran terlebih dahulu.');
            return;
        }
        if (checkoutStep === 2 && !cartComplete) {
            const missing =
                !data.client_phone.trim() || !phoneValid
                    ? ['Nomor WhatsApp', phoneRef]
                    : !data.domain_name.trim()
                      ? ['Nama domain', domainNameRef]
                      : ['Ekstensi domain', domainIdRef];
            setCartNotice(
                !data.client_phone.trim()
                    ? 'Lengkapi Nomor WhatsApp terlebih dahulu.'
                    : !phoneValid
                      ? 'Format Nomor WhatsApp tidak valid.'
                      : `Lengkapi ${missing[0]} terlebih dahulu.`,
            );
            setInvalidField(missing[0]);
            missing[1].current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
            missing[1].current?.focus?.();
            return;
        }
        setCartNotice('');
        setInvalidField('');
        setCheckoutStep(Math.min(checkoutStep + 1, 4));
    }

    return (
        <PublicLayout title="Minta Penawaran">
            <form
                onSubmit={submit}
                noValidate
                className="mx-auto max-w-6xl space-y-6 px-4 py-12"
            >
                {isDomainCheckout && (
                    <Stepper
                        currentStep={checkoutStep}
                        onStepChange={setCheckoutStep}
                        canNavigateToStep={(target, current) =>
                            target !== 1 && canNavigateToStep(target, current)
                        }
                        indicatorOnly
                    />
                )}
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-semibold">
                            {isDomainCheckout
                                ? 'Selesaikan pesanan domain'
                                : 'Minta Penawaran'}
                        </h1>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Langkah aman, tanpa pembayaran otomatis.
                    </p>
                </div>
                <div
                    className={
                        isDomainCheckout
                            ? 'grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]'
                            : 'max-w-2xl'
                    }
                >
                    <div className="space-y-4">
                        <p className="rounded-xl border bg-muted/40 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                            Pesanan dibuat sebagai{' '}
                            <strong>{buyer?.name}</strong> ({buyer?.email}).
                        </p>
                        {errors.pending_order && !data.confirm_new_order && (
                            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
                                <p>{errors.pending_order}</p>
                                {pendingOrder?.order_number && (
                                    <a
                                        href={`/cek-status-pesanan?order=${encodeURIComponent(pendingOrder.order_number)}`}
                                        className="mt-3 mr-2 inline-flex rounded-lg border border-primary/40 px-3 py-2 text-xs font-semibold text-primary"
                                    >
                                        Lihat pesanan sebelumnya
                                    </a>
                                )}
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="mt-3"
                                    onClick={() =>
                                        setData('confirm_new_order', true)
                                    }
                                >
                                    Tetap buat pesanan baru
                                </Button>
                            </div>
                        )}
                        <div
                            className={
                                !isDomainCheckout || checkoutStep <= 2
                                    ? 'space-y-4'
                                    : 'hidden'
                            }
                        >
                            <Field
                                label="Nomor WhatsApp"
                                error={errors.client_phone}
                            >
                                <div className="relative">
                                    <Input
                                        ref={phoneRef}
                                        className={
                                            invalidField === 'Nomor WhatsApp'
                                                ? 'border-destructive pr-10'
                                                : ''
                                        }
                                        type="tel"
                                        inputMode="tel"
                                        autoComplete="tel"
                                        placeholder="08123456789"
                                        value={data.client_phone}
                                        onChange={(e) =>
                                            setData(
                                                'client_phone',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {invalidField === 'Nomor WhatsApp' && (
                                        <AlertCircle
                                            className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-destructive"
                                            aria-label={cartNotice}
                                            title={cartNotice}
                                        />
                                    )}
                                </div>
                                {!errors.client_phone &&
                                    invalidField === 'Nomor WhatsApp' && (
                                        <InputError message={cartNotice} />
                                    )}
                            </Field>
                            <Field label="Jenis pesanan">
                                <Select
                                    value={data.order_type}
                                    onValueChange={(value) =>
                                        setData('order_type', value)
                                    }
                                >
                                    <SelectTrigger className="h-9 w-full">
                                        <SelectValue placeholder="Pilih jenis pesanan" />
                                    </SelectTrigger>
                                    <SelectContent
                                        position="popper"
                                        sideOffset={4}
                                        className="border border-input bg-background p-2 text-popover-foreground shadow-xl"
                                    >
                                        <SelectItem value="website">
                                            Website
                                        </SelectItem>
                                        <SelectItem value="domain">
                                            Domain
                                        </SelectItem>
                                        <SelectItem value="both">
                                            Website + Domain
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                            {needsWeb && (
                                <Field
                                    label="Paket website"
                                    error={errors.web_service_id}
                                >
                                    <Select
                                        value={data.web_service_id}
                                        onValueChange={(value) =>
                                            setData('web_service_id', value)
                                        }
                                    >
                                        <SelectTrigger className="h-9 w-full">
                                            <SelectValue placeholder="Pilih paket" />
                                        </SelectTrigger>
                                        <SelectContent
                                            position="popper"
                                            sideOffset={4}
                                            className="border border-input bg-background p-2 text-popover-foreground shadow-xl"
                                        >
                                            {webServices.map((item) => (
                                                <SelectItem
                                                    key={item.id}
                                                    value={String(item.id)}
                                                >
                                                    {item.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}

                            {needsDomain && (
                                <div className="grid gap-4">
                                    <div className="grid gap-4 sm:grid-cols-[1fr_11rem]">
                                        <Field
                                            label="Nama domain"
                                            error={errors.domain_name}
                                        >
                                            <div className="relative">
                                                <Input
                                                    ref={domainNameRef}
                                                    className={
                                                        invalidField ===
                                                        'Nama domain'
                                                            ? 'border-destructive pr-10'
                                                            : ''
                                                    }
                                                    placeholder="tokoku"
                                                    value={data.domain_name}
                                                    onChange={(e) =>
                                                        setData(
                                                            'domain_name',
                                                            e.target.value
                                                                .toLowerCase()
                                                                .replace(
                                                                    /[^a-z0-9-]/g,
                                                                    '',
                                                                ),
                                                        )
                                                    }
                                                />
                                                {invalidField ===
                                                    'Nama domain' && (
                                                    <AlertCircle
                                                        className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-destructive"
                                                        aria-label={cartNotice}
                                                        title={cartNotice}
                                                    />
                                                )}
                                            </div>
                                        </Field>

                                        <Field
                                            label="Ekstensi"
                                            error={errors.domain_id}
                                        >
                                            <Select
                                                value={data.domain_id}
                                                onValueChange={(value) =>
                                                    setData('domain_id', value)
                                                }
                                            >
                                                <SelectTrigger
                                                    ref={domainIdRef}
                                                    className="h-9 w-full"
                                                >
                                                    <SelectValue placeholder="Pilih ekstensi" />
                                                </SelectTrigger>
                                                <SelectContent
                                                    position="popper"
                                                    sideOffset={4}
                                                >
                                                    {domains.map((item) => (
                                                        <SelectItem
                                                            key={item.id}
                                                            value={String(
                                                                item.id,
                                                            )}
                                                        >
                                                            {item.extension}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                    </div>

                                    {selectedDomain && data.domain_name && (
                                        <p className="rounded-lg border bg-muted/40 px-3 py-2 text-sm text-slate-600 dark:text-slate-300">
                                            Akan dicek ke Liqu.id saat dikirim:{' '}
                                            <strong>
                                                {data.domain_name}
                                                {selectedDomain.extension}
                                            </strong>
                                            . Jika kredensial API belum diisi,
                                            pesanan tetap masuk untuk dicek
                                            manual.
                                        </p>
                                    )}
                                </div>
                            )}
                            <Field
                                label="Catatan tambahan"
                                error={errors.notes}
                            >
                                <Textarea
                                    className="min-h-28 font-normal placeholder:font-normal placeholder:text-slate-500 dark:placeholder:text-slate-400"
                                    placeholder="Ceritakan kebutuhan website/domain Anda"
                                    value={data.notes}
                                    onChange={(e) =>
                                        setData('notes', e.target.value)
                                    }
                                />
                            </Field>
                            <input
                                className="hidden"
                                tabIndex="-1"
                                autoComplete="off"
                                value={data.website_url}
                                onChange={(e) =>
                                    setData('website_url', e.target.value)
                                }
                            />
                        </div>
                        {isDomainCheckout && checkoutStep === 2 && (
                            <div className="rounded-xl border bg-card p-5 text-sm">
                                <p className="font-medium">Detail domain</p>
                                <p className="mt-2 text-slate-600 dark:text-slate-300">
                                    {data.domain_name}
                                    {selectedDomain.extension}
                                </p>
                            </div>
                        )}
                        {isDomainCheckout && checkoutStep === 3 && (
                            <div className="space-y-4 rounded-xl border bg-card p-5">
                                <div>
                                    <p className="font-medium">
                                        Pilih metode pembayaran
                                    </p>
                                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                        Pilih salah satu metode pembayaran yang
                                        tersedia.
                                    </p>
                                </div>
                                <div className="flex min-w-0 flex-col gap-3 pb-1 sm:flex-row">
                                    {[
                                        ['qris', 'QRIS'],
                                        ['dana', 'DANA'],
                                        ['bank_transfer', 'Transfer Rekening'],
                                    ]
                                        .filter(([value]) =>
                                            paymentMethods.includes(value),
                                        )
                                        .map(([value, label]) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => {
                                                    setData(
                                                        'payment_method',
                                                        value,
                                                    );
                                                    setCartNotice('');
                                                }}
                                                className={`min-w-0 flex-1 rounded-3xl border p-4 text-left transition-[flex,background-color,color,box-shadow] duration-500 ease-out sm:p-5 ${data.payment_method === value ? 'bg-primary text-primary-foreground shadow-lg sm:flex-[2]' : 'bg-card text-card-foreground hover:bg-accent'}`}
                                            >
                                                <span className="font-medium">
                                                    {label}
                                                </span>
                                                {data.payment_method ===
                                                    value && (
                                                    <>
                                                        <span
                                                            className={`mt-1 block text-xs ${data.payment_method === value ? 'text-primary-foreground/90' : 'text-foreground'}`}
                                                        >
                                                            {value === 'qris' &&
                                                            paymentDetails[
                                                                value
                                                            ] ? (
                                                                <>
                                                                    <img
                                                                        src={
                                                                            paymentDetails[
                                                                                value
                                                                            ].startsWith(
                                                                                'http',
                                                                            )
                                                                                ? paymentDetails[
                                                                                      value
                                                                                  ]
                                                                                : `/storage/${paymentDetails[value]}`
                                                                        }
                                                                        alt="QRIS"
                                                                        className="mt-3 max-h-48 rounded-lg bg-white p-2"
                                                                    />
                                                                    <a
                                                                        href={
                                                                            paymentDetails[
                                                                                value
                                                                            ].startsWith(
                                                                                'http',
                                                                            )
                                                                                ? paymentDetails[
                                                                                      value
                                                                                  ]
                                                                                : `/storage/${paymentDetails[value]}`
                                                                        }
                                                                        download
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="mt-3 inline-flex rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-sm hover:bg-slate-100"
                                                                    >
                                                                        Download
                                                                        QRIS
                                                                    </a>
                                                                </>
                                                            ) : (
                                                                paymentDetails[
                                                                    value
                                                                ] ||
                                                                'Pembayaran manual'
                                                            )}
                                                        </span>
                                                        {[
                                                            'dana',
                                                            'bank_transfer',
                                                        ].includes(value) &&
                                                            paymentDetails[
                                                                value
                                                            ] && (
                                                                <span
                                                                    role="button"
                                                                    tabIndex={0}
                                                                    className={`mt-3 inline-flex items-center gap-1 text-xs font-medium ${data.payment_method === value ? 'text-primary-foreground' : 'text-primary'}`}
                                                                    onClick={(
                                                                        event,
                                                                    ) => {
                                                                        event.stopPropagation();
                                                                        copyPayment(
                                                                            paymentDetails[
                                                                                value
                                                                            ],
                                                                            value,
                                                                        );
                                                                    }}
                                                                    onKeyDown={(
                                                                        event,
                                                                    ) => {
                                                                        if (
                                                                            event.key ===
                                                                                'Enter' ||
                                                                            event.key ===
                                                                                ' '
                                                                        ) {
                                                                            event.preventDefault();
                                                                            event.stopPropagation();
                                                                            copyPayment(
                                                                                paymentDetails[
                                                                                    value
                                                                                ],
                                                                                value,
                                                                            );
                                                                        }
                                                                    }}
                                                                >
                                                                    {copiedPayment ===
                                                                    value ? (
                                                                        <Check className="size-3" />
                                                                    ) : (
                                                                        <Copy className="size-3" />
                                                                    )}
                                                                    {copiedPayment ===
                                                                    value
                                                                        ? 'Tersalin'
                                                                        : 'Salin'}
                                                                </span>
                                                            )}
                                                    </>
                                                )}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        )}
                        {processing && (
                            <div
                                className="h-20 animate-pulse rounded-xl bg-muted"
                                aria-label="Memuat pesanan"
                            />
                        )}
                    </div>
                    {isDomainCheckout && (
                        <div className="space-y-3 lg:col-start-2 lg:row-start-1">
                            <OrderSummary
                                domain={selectedDomain}
                                name={data.domain_name}
                            />
                            <div className="flex justify-between gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={checkoutStep <= 2}
                                    onClick={() =>
                                        setCheckoutStep(
                                            Math.max(checkoutStep - 1, 2),
                                        )
                                    }
                                >
                                    Sebelumnya
                                </Button>
                                {checkoutStep < 3 ? (
                                    <Button type="button" onClick={nextStep}>
                                        Lanjutkan
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={processing || !cartComplete}
                                    >
                                        {processing
                                            ? 'Memproses...'
                                            : 'Kirim Pesanan'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </PublicLayout>
    );
}

function OrderSummary({ domain, name }) {
    const price = Number(domain.promo_price || domain.price);
    const tax = Math.round(price * 0.11);
    return (
        <aside className="h-fit rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Daftar pesanan</h2>
            <p className="mt-4 font-medium">
                {name}
                {domain.extension}
            </p>
            <div className="mt-5 space-y-3 text-sm">
                <SummaryLine
                    label="Registrasi domain – 1 tahun"
                    value={price}
                />
                <SummaryLine label="Biaya ICANN" value={3313} />
                <SummaryLine label="Proteksi Privasi Domain WHOIS" value={0} />
                <hr />
                <SummaryLine label="Pajak" value={tax} />
                <hr />
                <SummaryLine label="Total" value={price + tax + 3313} strong />
            </div>
        </aside>
    );
}

function SummaryLine({ label, value, strong = false }) {
    return (
        <div
            className={`flex justify-between gap-3 ${strong ? 'text-lg font-bold' : ''}`}
        >
            <span>{label}</span>
            <span>Rp {Number(value).toLocaleString('id-ID')}</span>
        </div>
    );
}

function Field({ label, error, children }) {
    return (
        <div className="grid gap-2 text-sm">
            <label className="font-medium">{label}</label>
            {children}
            <InputError message={error} />
        </div>
    );
}
