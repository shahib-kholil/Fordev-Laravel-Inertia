import { useForm } from '@inertiajs/react';
import { AlertCircle, Check, Copy } from 'lucide-react';
import { useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import SearchSelect from '@/components/ui/search-select';
import { countries } from '@/data/countries';
import Field from '@/components/order/field';
import OrderSummary from '@/components/order/order-summary';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import PublicLayout from '@/layouts/public-layout';

export default function OrderForm({
    domains,
    defaults = {},
    buyer,
    pendingOrder,

    locations = [],
    bundle,
}) {
    const [cartNotice, setCartNotice] = useState(defaults.edit_error ?? '');
    const [couponNotice, setCouponNotice] = useState('');
    const [couponChecking, setCouponChecking] = useState(false);
    const [couponDiscount, setCouponDiscount] = useState(
        Number(defaults.coupon_discount ?? 0),
    );
    const [invalidField, setInvalidField] = useState('');
    const isEditing = Boolean(defaults.order_number);

    const [countrySearch, setCountrySearch] = useState('');
    const [stateSearch, setStateSearch] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const phoneRef = useRef(null);
    const domainNameRef = useRef(null);
    const domainIdRef = useRef(null);
    const addressRef = useRef(null);
    const cityRef = useRef(null);
    const stateRef = useRef(null);
    const zipcodeRef = useRef(null);
    const countryRef = useRef(null);

    const { data, setData, post, put, processing, errors } = useForm({
        client_phone: defaults.client_phone ?? '',
        order_type: 'domain',
        domain_id: defaults.domain_id ?? '',
        domain_name: defaults.domain_name ?? '',
        bundle_id: defaults.bundle_id ?? '',
        company: defaults.company ?? '',
        address_line_1: defaults.address_line_1 ?? '',
        city: defaults.city ?? '',
        state: defaults.state ?? '',
        zipcode: defaults.zipcode ?? '',
        country_code: defaults.country_code ?? 'ID',
        notes: defaults.notes ?? '',
        website_url: '',
        confirm_new_order: defaults.confirm_new_order ?? false,
        order_number: defaults.order_number ?? '',
        coupon_code: defaults.coupon_code ?? '',
    });

    const bundleDomains = bundle?.domains ?? [];
    const isBundleCheckout = Boolean(bundle && bundleDomains.length > 1);
    const selectedBundleDomain = bundleDomains[0];

    const states = locations.map((province) => province.name);
    const selectedProvince = locations.find(
        (province) => province.name === data.state,
    );
    const cities = selectedProvince?.cities?.map((city) => city.name) ?? [];

    const selectedDomain =
        domains.find((item) => String(item.id) === String(data.domain_id)) ??
        selectedBundleDomain;
    const isDomainCheckout = Boolean(selectedDomain);
    const needsDomain = true;
    const phoneValid = /^[0-9+()\s-]{8,30}$/.test(data.client_phone.trim());
    const zipcodeValid = /^\d{5}$/.test(data.zipcode.trim());
    const cartComplete = Boolean(
        phoneValid &&
        data.client_phone.trim() &&
        data.domain_name.trim() &&
        data.domain_id,
    );
    const formComplete = Boolean(
        phoneValid &&
        data.client_phone.trim() &&
        cartComplete &&
        data.address_line_1.trim() &&
        data.city.trim() &&
        data.state.trim() &&
        zipcodeValid,
    );

    function submit(e) {
        e.preventDefault();
        if (!formComplete) {
            return;
        }
        const submit = isEditing ? put : post;
        const url = isEditing
            ? `/order/${encodeURIComponent(data.order_number)}`
            : '/order';
        submit(url, { preserveState: true, preserveScroll: true });
    }

    function validateForm() {
        if (!formComplete) {
            const missing =
                !data.client_phone.trim() || !phoneValid
                    ? ['Nomor WhatsApp', phoneRef]
                    : !data.domain_name.trim()
                      ? ['Nama domain', domainNameRef]
                      : !data.domain_id
                        ? ['Ekstensi domain', domainIdRef]
                        : !data.country_code.trim()
                          ? ['Negara', countryRef]
                          : !data.state.trim()
                            ? ['Provinsi', stateRef]
                            : !data.city.trim()
                              ? ['Kota', cityRef]
                              : !zipcodeValid
                                ? ['Kode pos', zipcodeRef]
                                : ['Alamat lengkap', addressRef];
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
    }

    if (defaults.edit_error) {
        return (
            <PublicLayout title="Edit Pesanan">
                <div className="mx-auto max-w-2xl space-y-4 px-4 py-12">
                    <h1 className="text-3xl font-semibold">Edit Pesanan</h1>
                    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                        {defaults.edit_error}
                    </div>
                    <a
                        href="/cek-status-pesanan"
                        className="inline-flex rounded-lg border border-primary/40 px-4 py-2 text-sm font-semibold text-primary"
                    >
                        Kembali ke status pesanan
                    </a>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout title="Minta Penawaran">
            <form
                onSubmit={submit}
                noValidate
                className="mx-auto max-w-6xl space-y-6 px-4 py-12"
            >
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-semibold">
                            {isDomainCheckout
                                ? 'Selesaikan pesanan domain'
                                : 'Minta Penawaran'}
                        </h1>
                    </div>
                </div>
                <div
                    className={
                        isDomainCheckout
                            ? 'grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]'
                            : 'max-w-2xl'
                    }
                >
                    <div className="space-y-4">
                        <p className="rounded-xl border bg-primary/40 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                            Pesanan dibuat sebagai{' '}
                            <strong>{buyer?.name}</strong> ({buyer?.email}).
                        </p>
                        {defaults.edit_error && (
                            <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                                {defaults.edit_error}
                            </p>
                        )}
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
                        {errors.form && (
                            <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                                {errors.form}
                            </p>
                        )}
                        <div className={'space-y-4'}>
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
                            <input
                                type="hidden"
                                name="order_type"
                                value="domain"
                            />
                            {needsDomain && (
                                <div className="grid gap-4">
                                    <div
                                        className={
                                            isBundleCheckout
                                                ? 'grid gap-4'
                                                : 'grid grid-cols-[minmax(0,1fr)_5.5rem] gap-4 sm:grid-cols-[1fr_11rem]'
                                        }
                                    >
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
                                                    maxLength={63}
                                                    pattern="[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
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

                                        {!isBundleCheckout && (
                                            <Field
                                                label="Ekstensi"
                                                error={
                                                    errors.domain_id ||
                                                    (invalidField ===
                                                    'Ekstensi domain'
                                                        ? cartNotice
                                                        : '')
                                                }
                                            >
                                                <Select
                                                    value={data.domain_id}
                                                    disabled={isEditing}
                                                    onValueChange={(value) =>
                                                        setData(
                                                            'domain_id',
                                                            value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger
                                                        ref={domainIdRef}
                                                        className={
                                                            invalidField ===
                                                            'Ekstensi domain'
                                                                ? 'h-9 w-full border-destructive'
                                                                : 'h-9 w-full'
                                                        }
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
                                        )}
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field
                                            label="Nama perusahaan (opsional)"
                                            error={errors.company}
                                        >
                                            <Input
                                                value={data.company}
                                                onChange={(e) =>
                                                    setData(
                                                        'company',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field
                                            label="Negara"
                                            error={
                                                errors.country_code ||
                                                (invalidField === 'Negara'
                                                    ? cartNotice
                                                    : '')
                                            }
                                        >
                                            <SearchSelect
                                                ref={countryRef}
                                                value={data.country_code}
                                                placeholder="Pilih negara"
                                                search={countrySearch}
                                                setSearch={setCountrySearch}
                                                options={countries.map(
                                                    (item) => ({
                                                        value: item.code,
                                                        label: item.name,
                                                    }),
                                                )}
                                                onChange={(value) =>
                                                    setData((current) => ({
                                                        ...current,
                                                        country_code: value,
                                                        state: '',
                                                        city: '',
                                                    }))
                                                }
                                            />
                                        </Field>
                                        <Field
                                            label="Provinsi"
                                            error={
                                                errors.state ||
                                                (invalidField === 'Provinsi'
                                                    ? cartNotice
                                                    : '')
                                            }
                                        >
                                            <SearchSelect
                                                ref={stateRef}
                                                value={data.state}
                                                placeholder="Pilih provinsi"
                                                search={stateSearch}
                                                setSearch={setStateSearch}
                                                options={states.map(
                                                    (value) => ({
                                                        value,
                                                        label: value,
                                                    }),
                                                )}
                                                onChange={(value) =>
                                                    setData((current) => ({
                                                        ...current,
                                                        state: value,
                                                        city: '',
                                                    }))
                                                }
                                                disabled={!states.length}
                                                invalid={
                                                    invalidField === 'Provinsi'
                                                }
                                            />
                                        </Field>
                                        <Field
                                            label="Kota"
                                            error={
                                                errors.city ||
                                                (invalidField === 'Kota'
                                                    ? cartNotice
                                                    : '')
                                            }
                                        >
                                            <SearchSelect
                                                ref={cityRef}
                                                value={data.city}
                                                placeholder="Pilih kota"
                                                search={citySearch}
                                                setSearch={setCitySearch}
                                                options={cities.map(
                                                    (value) => ({
                                                        value,
                                                        label: value,
                                                    }),
                                                )}
                                                onChange={(value) =>
                                                    setData('city', value)
                                                }
                                                disabled={!cities.length}
                                                invalid={
                                                    invalidField === 'Kota'
                                                }
                                            />
                                        </Field>
                                        <Field
                                            label="Kode pos"
                                            error={
                                                errors.zipcode ||
                                                (invalidField === 'Kode pos'
                                                    ? cartNotice
                                                    : '')
                                            }
                                        >
                                            <Input
                                                ref={zipcodeRef}
                                                className={
                                                    invalidField === 'Kode pos'
                                                        ? 'border-destructive pr-10'
                                                        : ''
                                                }
                                                inputMode="numeric"
                                                pattern="[0-9]{5}"
                                                maxLength={5}
                                                placeholder="12345"
                                                value={data.zipcode}
                                                onChange={(e) =>
                                                    setData(
                                                        'zipcode',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        </Field>
                                        <Field
                                            label="Alamat lengkap"
                                            error={
                                                errors.address_line_1 ||
                                                (invalidField ===
                                                'Alamat lengkap'
                                                    ? cartNotice
                                                    : '')
                                            }
                                        >
                                            <Input
                                                ref={addressRef}
                                                className={
                                                    invalidField ===
                                                    'Alamat lengkap'
                                                        ? 'border-destructive pr-10'
                                                        : ''
                                                }
                                                value={data.address_line_1}
                                                onChange={(e) =>
                                                    setData(
                                                        'address_line_1',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        </Field>
                                    </div>
                                    {selectedDomain && data.domain_name && (
                                        <p className="rounded-lg border bg-muted/40 px-3 py-2 text-sm text-slate-600 dark:text-slate-300">
                                            Data di atas diperlukan untuk
                                            registrasi domain.{' '}
                                            <strong>
                                                Kami sangat memprioritaskan
                                                privasi dan keamanan data Anda.
                                            </strong>
                                        </p>
                                    )}
                                </div>
                            )}
                            <div className="space-y-3 rounded-2xl border bg-card p-4 sm:p-5">
                                <div>
                                    <h2 className="font-semibold">
                                        Gunakan Kode Promo
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Masukkan kode promo jika Anda
                                        memilikinya.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <Input
                                        value={data.coupon_code}
                                        disabled={isEditing}
                                        maxLength={40}
                                        placeholder="Masukkan Kode Promo"
                                        onChange={(e) => {
                                            setCouponNotice('');
                                            setData(
                                                'coupon_code',
                                                e.target.value.toUpperCase(),
                                            );
                                        }}
                                    />
                                    {!isEditing && (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className="sm:min-w-32"
                                            onClick={async () => {
                                                if (!data.coupon_code) {
                                                    setCouponNotice(
                                                        'Masukkan kode promo terlebih dahulu.',
                                                    );
                                                    return;
                                                }
                                                setCouponChecking(true);
                                                setCouponNotice(
                                                    'Memeriksa kode promo...',
                                                );
                                                const response = await fetch(
                                                    '/order/coupon',
                                                    {
                                                        method: 'POST',
                                                        headers: {
                                                            'Content-Type':
                                                                'application/json',
                                                            Accept: 'application/json',
                                                            'X-CSRF-TOKEN':
                                                                document.querySelector(
                                                                    'meta[name="csrf-token"]',
                                                                )?.content ??
                                                                '',
                                                        },
                                                        body: JSON.stringify({
                                                            domain_id:
                                                                data.domain_id,
                                                            bundle_id:
                                                                data.bundle_id ||
                                                                undefined,
                                                            coupon_code:
                                                                data.coupon_code,
                                                        }),
                                                    },
                                                );
                                                setCouponChecking(false);
                                                if (response.ok) {
                                                    const result =
                                                        await response.json();
                                                    setCouponDiscount(
                                                        result.discount ?? 0,
                                                    );
                                                } else {
                                                    setCouponDiscount(0);
                                                }
                                                setCouponNotice(
                                                    response.ok
                                                        ? 'Kode promo berhasil diterapkan.'
                                                        : response.status ===
                                                            419
                                                          ? 'Sesi halaman sudah kedaluwarsa. Muat ulang halaman.'
                                                          : 'Kode promo tidak berlaku.',
                                                );
                                            }}
                                            disabled={couponChecking}
                                        >
                                            Pakai Promo
                                        </Button>
                                    )}
                                </div>
                                {couponNotice && (
                                    <p className="text-sm text-muted-foreground">
                                        {couponNotice}
                                    </p>
                                )}
                                <InputError message={errors.coupon_code} />
                            </div>
                            <Field
                                label="Catatan tambahan"
                                error={errors.notes}
                            >
                                <Textarea
                                    className="min-h-28 font-normal placeholder:font-normal placeholder:text-slate-500 dark:placeholder:text-slate-400"
                                    placeholder="Ceritakan kebutuhan website/domain Anda"
                                    maxLength={2000}
                                    value={data.notes}
                                    onChange={(e) =>
                                        setData('notes', e.target.value)
                                    }
                                />
                            </Field>
                            <div
                                className="absolute -left-[9999px] h-px w-px overflow-hidden"
                                aria-hidden="true"
                            >
                                <label htmlFor="website_url">Website</label>
                                <input
                                    id="website_url"
                                    name="website_url"
                                    tabIndex={-1}
                                    autoComplete="off"
                                    value={data.website_url}
                                    onChange={(e) =>
                                        setData('website_url', e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        {processing && (
                            <div
                                className="h-20 animate-pulse rounded-xl bg-muted"
                                aria-label="Memuat pesanan"
                            />
                        )}
                    </div>
                    {isDomainCheckout ? (
                        <div className="space-y-3 lg:col-start-2 lg:row-start-1">
                            <OrderSummary
                                domain={selectedDomain}
                                name={data.domain_name}
                                bundle={isBundleCheckout ? bundle : null}
                                couponDiscount={couponDiscount}
                            />
                            <div className="flex justify-end gap-3">
                                <Button
                                    type="submit"
                                    disabled={processing || !formComplete}
                                >
                                    {processing
                                        ? 'Memproses...'
                                        : defaults.order_number
                                          ? 'Edit Pesanan'
                                          : 'Kirim Pesanan'}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            type="submit"
                            disabled={processing || !formComplete}
                        >
                            {processing
                                ? 'Memproses...'
                                : defaults.order_number
                                  ? 'Edit Pesanan'
                                  : 'Kirim Pesanan'}
                        </Button>
                    )}
                </div>
            </form>
        </PublicLayout>
    );
}
