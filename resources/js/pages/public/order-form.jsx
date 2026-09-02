import { useForm } from '@inertiajs/react';
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

export default function OrderForm({ webServices, domains, defaults = {} }) {
    const { data, setData, post, processing, errors } = useForm({
        client_name: '',
        client_email: '',
        client_phone: '',
        order_type: defaults.order_type ?? 'website',
        web_service_id: '',
        domain_id: defaults.domain_id ?? '',
        domain_name: defaults.domain_name ?? '',
        notes: '',
        website_url: '',
    });
    const needsWeb = ['website', 'both'].includes(data.order_type);
    const needsDomain = ['domain', 'both'].includes(data.order_type);
    const selectedDomain = domains.find(
        (item) => String(item.id) === String(data.domain_id),
    );

    function submit(e) {
        e.preventDefault();
        post('/order');
    }

    return (
        <PublicLayout title="Minta Penawaran">
            <form
                onSubmit={submit}
                className="mx-auto max-w-2xl space-y-4 px-4 py-12"
            >
                <h1 className="text-3xl font-semibold">Minta Penawaran</h1>
                <Field label="Nama lengkap" error={errors.client_name}>
                    <Input
                        placeholder="Contoh: Budi Santoso"
                        value={data.client_name}
                        onChange={(e) => setData('client_name', e.target.value)}
                        required
                    />
                </Field>
                <Field label="Email" error={errors.client_email}>
                    <Input
                        type="email"
                        placeholder="nama@email.com"
                        value={data.client_email}
                        onChange={(e) =>
                            setData('client_email', e.target.value)
                        }
                        required
                    />
                </Field>
                <Field label="Nomor WhatsApp" error={errors.client_phone}>
                    <Input
                        placeholder="08123456789"
                        value={data.client_phone}
                        onChange={(e) =>
                            setData('client_phone', e.target.value)
                        }
                        required
                    />
                </Field>
                <Field label="Jenis pesanan">
                    <Select
                        value={data.order_type}
                        onValueChange={(value) => setData('order_type', value)}
                    >
                        <SelectTrigger className="h-9 w-full">
                            <SelectValue placeholder="Pilih jenis pesanan" />
                        </SelectTrigger>
                        <SelectContent
                            position="popper"
                            sideOffset={4}
                            className="border border-input bg-background p-2 text-popover-foreground shadow-xl"
                        >
                            <SelectItem value="website">Website</SelectItem>
                            <SelectItem value="domain">Domain</SelectItem>
                            <SelectItem value="both">
                                Website + Domain
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
                {needsWeb && (
                    <Field label="Paket website" error={errors.web_service_id}>
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
                                <Input
                                    placeholder="tokoku"
                                    value={data.domain_name}
                                    onChange={(e) =>
                                        setData(
                                            'domain_name',
                                            e.target.value
                                                .toLowerCase()
                                                .replace(/[^a-z0-9-]/g, ''),
                                        )
                                    }
                                />
                            </Field>

                            <Field label="Ekstensi" error={errors.domain_id}>
                                <Select
                                    value={data.domain_id}
                                    onValueChange={(value) =>
                                        setData('domain_id', value)
                                    }
                                >
                                    <SelectTrigger className="h-9 w-full">
                                        <SelectValue placeholder="Pilih ekstensi" />
                                    </SelectTrigger>
                                    <SelectContent
                                        position="popper"
                                        sideOffset={4}
                                    >
                                        {domains.map((item) => (
                                            <SelectItem
                                                key={item.id}
                                                value={String(item.id)}
                                            >
                                                {item.extension} - Rp{' '}
                                                {Number(
                                                    item.price,
                                                ).toLocaleString('id-ID')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>

                        {selectedDomain && data.domain_name && (
                            <p className="rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                                Akan dicek ke Liqu.id saat dikirim:{' '}
                                <strong>
                                    {data.domain_name}
                                    {selectedDomain.extension}
                                </strong>
                                . Jika kredensial API belum diisi, pesanan tetap
                                masuk untuk dicek manual.
                            </p>
                        )}
                    </div>
                )}
                <Field label="Catatan tambahan" error={errors.notes}>
                    <Textarea
                        className="min-h-28 font-normal placeholder:font-normal placeholder:text-muted-foreground/60"
                        placeholder="Ceritakan kebutuhan website/domain Anda"
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                    />
                </Field>
                <input
                    className="hidden"
                    tabIndex="-1"
                    autoComplete="off"
                    value={data.website_url}
                    onChange={(e) => setData('website_url', e.target.value)}
                />
                <Button disabled={processing}>Kirim</Button>
            </form>
        </PublicLayout>
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
