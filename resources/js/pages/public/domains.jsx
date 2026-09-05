import { Link, useForm } from '@inertiajs/react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import PublicLayout from '@/layouts/public-layout';

const cardClass = 'rounded-2xl border bg-card p-5 shadow-sm';

export default function Domains({ domains, filters = {}, check }) {
    const extensions = domains.data;
    const { data, setData, get, errors, processing } = useForm({
        name: filters.name ?? '',
        extension: filters.extension ?? extensions[0]?.extension ?? '.id',
    });

    function submit(e) {
        e.preventDefault();
        get('/domain', { preserveState: true });
    }

    return (
        <PublicLayout title="Cek Domain">
            <div className="mx-auto max-w-6xl px-4 py-12">
                <section className="rounded-3xl border bg-card p-5 shadow-sm sm:p-8">
                    <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
                        Cari nama domain impianmu
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                        Mulai dari nama brand. Sebelum cari, Anda bisa
                        membandingkan ekstensi dan harga dulu lewat tabel.
                    </p>
                    <form
                        onSubmit={submit}
                        className="mt-6 grid gap-2 rounded-2xl border bg-background p-4 sm:grid-cols-[1fr_9rem_auto]"
                    >
                        <Input
                            aria-label="Nama domain"
                            className="border shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0 dark:placeholder:text-muted-foreground/50"
                            placeholder="namadomain"
                            value={data.name}
                            onChange={(e) =>
                                setData(
                                    'name',
                                    e.target.value
                                        .toLowerCase()
                                        .replace(/[^a-z0-9-]/g, ''),
                                )
                            }
                            required
                        />

                        {/* Select Ekstensi Domain */}
                        <Select
                            value={data.extension}
                            onValueChange={(value) =>
                                setData('extension', value)
                            }
                        >
                            <SelectTrigger
                                aria-label="Ekstensi domain"
                                className="h-9 w-full"
                            >
                                <SelectValue placeholder="Ekstensi" />
                            </SelectTrigger>
                            <SelectContent
                                position="popper"
                                sideOffset={4}
                                className="border border-input bg-background p-1 text-popover-foreground shadow-xl"
                            >
                                {extensions.map((item) => (
                                    <SelectItem
                                        key={item.id}
                                        value={item.extension}
                                    >
                                        {item.extension}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button disabled={processing || !extensions.length}>
                            Cek domain
                        </Button>
                    </form>
                    {errors.name && (
                        <p className="mt-2 text-sm text-destructive">
                            Nama domain hanya boleh huruf, angka, dan strip.
                        </p>
                    )}
                </section>
                {check ? (
                    <DomainResults check={check} extensions={extensions} />
                ) : (
                    <ExtensionCatalog extensions={extensions} />
                )}
            </div>
        </PublicLayout>
    );
}

function DomainResults({ check, extensions }) {
    if (!extensions.length) return <EmptyExtensions />;

    const name = check.domain.slice(
        0,
        -matchedExtension(check.domain, extensions).length,
    );
    const requestedExtension = matchedExtension(check.domain, extensions);
    const requested = domainOption(
        name,
        extensions.find((item) => item.extension === requestedExtension) ??
            extensions[0],
        check.available !== false,
    );
    const alternatives = extensions
        .filter((item) => item.extension !== requested.extension)
        .slice(0, 18)
        .map((item) => domainOption(name, item, true));
    const bundle = extensions
        .slice(0, 3)
        .map((item) => domainOption(name, item, true));
    const isAvailable = check.available !== false;

    return (
        <section className="mt-8 space-y-8">
            <div>
                {isAvailable ? (
                    <h2 className="text-2xl font-semibold">{name}</h2>
                ) : (
                    <h2 className="text-2xl font-semibold">
                        {check.domain} sudah terdaftar. Berikut domain
                        alternatif yang tersedia!
                    </h2>
                )}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
                <HeroDomain
                    option={requested}
                    title="Sesuai Permintaan"
                    unavailable={!isAvailable}
                />
                {isAvailable && bundle.length > 1 && (
                    <BundleCard name={name} options={bundle} />
                )}
            </div>
            <PromoNote />
            <div>
                <h3 className="text-xl font-semibold">
                    Pilihan domain lainnya
                </h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {alternatives.map((option) => (
                        <AlternativeCard key={option.domain} option={option} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function ExtensionCatalog({ extensions }) {
    const [sort, setSort] = useState('admin');

    // 1. Dibuat copy [...extensions] agar tidak me-mutate props asli
    const rows = useMemo(
        () =>
            [...extensions].sort((a, b) =>
                sort === 'cheapest'
                    ? salePrice(a) - salePrice(b)
                    : sort === 'highest'
                      ? salePrice(b) - salePrice(a)
                      : sort === 'az'
                        ? a.extension.localeCompare(b.extension)
                        : 0,
            ),
        [extensions, sort],
    );

    if (!extensions.length) return <EmptyExtensions />;

    return (
        <section className="mt-8">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                    <h2 className="text-xl font-semibold">
                        Daftar ekstensi domain
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Filter ekstensi sebelum mencari nama domain.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger
                            aria-label="Urutkan ekstensi"
                            className="h-9 w-[150px]"
                        >
                            <SelectValue placeholder="Urutkan" />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={4}>
                            <SelectItem value="admin">Default</SelectItem>
                            <SelectItem value="cheapest">Termurah</SelectItem>
                            <SelectItem value="highest">Termahal</SelectItem>
                            <SelectItem value="az">A-Z</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border px-4">
                <Table className="min-w-[560px]">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-semibold">
                                Ekstensi
                            </TableHead>
                            <TableHead className="font-semibold">
                                Tahun Pertama
                            </TableHead>
                            <TableHead className="font-semibold">
                                Perpanjang
                            </TableHead>
                            <TableHead className="font-semibold">
                                Transfer
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((item, index) => (
                            <TableRow
                                key={item.id}
                                className={
                                    index % 2 === 0
                                        ? 'bg-muted/60'
                                        : 'bg-background'
                                }
                            >
                                <TableCell className="font-semibold text-blue-600 dark:text-blue-400">
                                    {item.extension}
                                </TableCell>
                                <TableCell className="">
                                    <Price
                                        option={domainOption(
                                            'domain',
                                            item,
                                            true,
                                        )}
                                    />
                                </TableCell>
                                <TableCell className="">
                                    {formatRupiah(
                                        item.renewal_price || item.price,
                                    )}
                                </TableCell>
                                <TableCell className="">
                                    {item.transfer_price
                                        ? formatRupiah(item.transfer_price)
                                        : '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </section>
    );
}

function HeroDomain({ option, title, unavailable }) {
    return (
        <article className={cardClass}>
            <Badge>{title}</Badge>
            <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-semibold">{option.domain}</h3>
                    <p className="mt-3 text-sm text-muted-foreground">
                        {unavailable
                            ? 'Domain utama tidak tersedia, coba alternatif di bawah.'
                            : 'Domain ini cocok untuk brand, bisnis, atau komunitas Anda.'}
                    </p>
                </div>
                <Price option={option} />
            </div>
            {!unavailable && (
                <Button className="mt-5" asChild>
                    <Link href={orderUrl(option)}>Daftarkan domain</Link>
                </Button>
            )}
        </article>
    );
}

function BundleCard({ name, options }) {
    const total = options.reduce((sum, item) => sum + item.salePrice, 0);
    return (
        <article className={cardClass}>
            <Badge variant="secondary">Praktis & hemat</Badge>
            <h3 className="mt-4 text-2xl font-semibold">
                {options.map((item) => item.domain).join(' + ')}
            </h3>
            <div className="mt-4">
                <span className="text-sm text-muted-foreground line-through">
                    {formatRupiah(
                        options.reduce(
                            (sum, item) => sum + item.normalPrice,
                            0,
                        ),
                    )}
                </span>
                <p className="text-2xl font-bold">{formatRupiah(total)}</p>
                <p className="text-xs text-muted-foreground">Tahun pertama</p>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
                Lebih hemat dengan visibilitas brand yang lebih tinggi. Kelola
                semua domain dalam satu akun.
            </p>
            <Button className="mt-5" asChild>
                <Link href={orderUrl({ domain: `${name}.id` })}>
                    Daftarkan domain
                </Link>
            </Button>
        </article>
    );
}

function AlternativeCard({ option }) {
    return (
        <article className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="font-semibold">{option.domain}</h3>
                    {option.badge && (
                        <Badge className="mt-2" variant="secondary">
                            {option.badge}
                        </Badge>
                    )}
                </div>
                <Sparkles className="size-4 text-primary" />
            </div>
            <div className="mt-4">
                <Price option={option} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>Perpanjang</span>
                <span className="text-right">
                    {formatRupiah(option.renewalPrice)}
                </span>
                <span>Transfer</span>
                <span className="text-right">
                    {option.transferPrice
                        ? formatRupiah(option.transferPrice)
                        : '-'}
                </span>
            </div>
            <Button className="mt-4 w-full" variant="outline" asChild>
                <Link href={orderUrl(option)}>Beli</Link>
            </Button>
        </article>
    );
}

function PromoNote() {
    return (
        <div className="rounded-2xl border bg-muted/40 p-4 text-sm">
            <p className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="size-4 text-primary" />
                Bonus konsultasi setup domain gratis
            </p>
            <p className="mt-1 text-muted-foreground">
                Daftarkan domain bersama paket website untuk dibantu koneksi
                DNS, email, dan SSL.
            </p>
        </div>
    );
}

function EmptyExtensions() {
    return (
        <section className="mt-8 rounded-2xl border bg-muted/40 p-5 text-sm text-muted-foreground">
            Belum ada ekstensi domain aktif. Tambahkan dulu dari panel admin.
        </section>
    );
}

function Price({ option }) {
    return (
        <div className="">
            {option.normalPrice > option.salePrice && (
                <p className="text-sm text-muted-foreground line-through">
                    {formatRupiah(option.normalPrice)}
                </p>
            )}
            <p className="font-bold">{formatRupiah(option.salePrice)}</p>
        </div>
    );
}

function matchedExtension(domain, extensions) {
    return (
        [...extensions]
            .sort((a, b) => b.extension.length - a.extension.length)
            .find((item) => domain.endsWith(item.extension))?.extension ??
        extensions[0]?.extension ??
        ''
    );
}

function formatRupiah(value) {
    return `Rp ${Number(value).toLocaleString('id-ID')}`;
}

function salePrice(item) {
    return Number(item.promo_price || item.price);
}

function domainOption(name, item, available) {
    return {
        id: item.id,
        domain: `${name}${item.extension}`,
        extension: item.extension,
        salePrice: salePrice(item),
        normalPrice: Number(item.price),
        renewalPrice: Number(item.renewal_price || item.price),
        transferPrice: Number(item.transfer_price || 0),
        available,
        badge: item.badge,
    };
}

function orderUrl(option) {
    return `/order?type=domain&domain_name=${encodeURIComponent(option.domain.split('.')[0])}&domain_id=${option.id ?? ''}`;
}
