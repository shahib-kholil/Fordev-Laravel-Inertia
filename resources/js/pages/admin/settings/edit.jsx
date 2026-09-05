import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SettingsEdit({ settings, packageCards }) {
    const { data, setData, post, processing, errors } = useForm({
        contact_email: settings.contact_email ?? '',
        contact_whatsapp: settings.contact_whatsapp ?? '',
        contact_address: settings.contact_address ?? '',
        social_instagram: settings.social_instagram ?? '',
        package_cards: packageCards,
        payment_methods: settings.payment_methods
            ? JSON.parse(settings.payment_methods)
            : ['qris', 'dana', 'bank_transfer'],
        payment_details: settings.payment_details
            ? JSON.parse(settings.payment_details)
            : { qris: '', dana: '', bank_transfer: '' },
        payment_qris: null,
        _method: 'put',
    });
    const paymentOptions = [
        ['qris', 'QRIS'],
        ['dana', 'DANA'],
        ['bank_transfer', 'Transfer Rekening'],
    ];
    function submit(e) {
        e.preventDefault();
        post('/admin/settings', { forceFormData: true });
    }
    return (
        <>
            <Head title="Settings" />
            <form onSubmit={submit} className="max-w-2xl space-y-4 p-4">
                <h1 className="text-2xl font-semibold">Settings</h1>
                <Field label="Email" error={errors.contact_email}>
                    <Input
                        type="email"
                        value={data.contact_email}
                        onChange={(e) =>
                            setData('contact_email', e.target.value)
                        }
                    />
                </Field>
                <Field label="WhatsApp" error={errors.contact_whatsapp}>
                    <Input
                        value={data.contact_whatsapp}
                        onChange={(e) =>
                            setData('contact_whatsapp', e.target.value)
                        }
                    />
                </Field>
                <Field label="Alamat" error={errors.contact_address}>
                    <textarea
                        className="min-h-24 w-full rounded-lg border bg-transparent p-2 text-sm"
                        value={data.contact_address}
                        onChange={(e) =>
                            setData('contact_address', e.target.value)
                        }
                    />
                </Field>
                <Field label="Instagram" error={errors.social_instagram}>
                    <Input
                        type="url"
                        value={data.social_instagram}
                        onChange={(e) =>
                            setData('social_instagram', e.target.value)
                        }
                    />
                </Field>
                <div className="space-y-4 border-t pt-6">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Metode pembayaran
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Pilih metode yang ditampilkan di checkout publik.
                        </p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                            {paymentOptions.map(([value, label]) => (
                                <label
                                    key={value}
                                    className="flex items-center gap-2 rounded-lg border p-3 text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={data.payment_methods.includes(
                                            value,
                                        )}
                                        onChange={(e) =>
                                            setData(
                                                'payment_methods',
                                                e.target.checked
                                                    ? [
                                                          ...data.payment_methods,
                                                          value,
                                                      ]
                                                    : data.payment_methods.filter(
                                                          (item) =>
                                                              item !== value,
                                                      ),
                                            )
                                        }
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="grid gap-4 rounded-2xl border p-4">
                        <h3 className="font-medium">Detail pembayaran</h3>
                        <Field label="QRIS" error={errors.payment_qris}>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setData(
                                        'payment_qris',
                                        e.target.files[0] ?? null,
                                    )
                                }
                            />
                            {data.payment_details.qris && (
                                <p className="text-xs text-muted-foreground">
                                    QRIS tersimpan. Upload gambar baru untuk
                                    menggantinya.
                                </p>
                            )}
                        </Field>
                        <Field
                            label="Nomor DANA"
                            error={errors['payment_details.dana']}
                        >
                            <Input
                                value={data.payment_details.dana}
                                onChange={(e) =>
                                    setData('payment_details', {
                                        ...data.payment_details,
                                        dana: e.target.value,
                                    })
                                }
                                placeholder="08xxxxxxxxxx"
                            />
                        </Field>
                        <Field
                            label="Transfer rekening"
                            error={errors['payment_details.bank_transfer']}
                        >
                            <textarea
                                className="min-h-24 w-full rounded-lg border bg-transparent p-2 text-sm"
                                placeholder="Contoh: BCA 123456789 a.n. ForDev"
                                value={data.payment_details.bank_transfer}
                                onChange={(e) =>
                                    setData('payment_details', {
                                        ...data.payment_details,
                                        bank_transfer: e.target.value,
                                    })
                                }
                            />
                        </Field>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">
                            Menu Paket Home
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Empat kartu Magic Bento tepat di bawah hero.
                        </p>
                    </div>
                    {data.package_cards.map((card, index) => (
                        <div
                            key={index}
                            className="grid gap-3 rounded-2xl border p-4 sm:grid-cols-2"
                        >
                            <h3 className="font-medium sm:col-span-2">
                                Kartu {index + 1}
                            </h3>
                            {['title', 'label', 'href'].map((field) => (
                                <Field
                                    key={field}
                                    label={
                                        {
                                            title: 'Judul',
                                            label: 'Label',
                                            href: 'Tautan',
                                        }[field]
                                    }
                                    error={
                                        errors[
                                            `package_cards.${index}.${field}`
                                        ]
                                    }
                                >
                                    <Input
                                        value={card[field]}
                                        maxLength={
                                            { title: 80, label: 60, href: 255 }[
                                                field
                                            ]
                                        }
                                        onChange={(e) =>
                                            setData(
                                                'package_cards',
                                                data.package_cards.map(
                                                    (item, itemIndex) =>
                                                        itemIndex === index
                                                            ? {
                                                                  ...item,
                                                                  [field]:
                                                                      e.target
                                                                          .value,
                                                              }
                                                            : item,
                                                ),
                                            )
                                        }
                                    />
                                </Field>
                            ))}
                            <Field
                                label="Deskripsi"
                                error={
                                    errors[`package_cards.${index}.description`]
                                }
                            >
                                <textarea
                                    className="min-h-20 w-full rounded-lg border bg-transparent p-2 text-sm"
                                    maxLength={240}
                                    value={card.description}
                                    onChange={(e) =>
                                        setData(
                                            'package_cards',
                                            data.package_cards.map(
                                                (item, itemIndex) =>
                                                    itemIndex === index
                                                        ? {
                                                              ...item,
                                                              description:
                                                                  e.target
                                                                      .value,
                                                          }
                                                        : item,
                                            ),
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                label="Keterangan saat diperbesar"
                                error={errors[`package_cards.${index}.details`]}
                            >
                                <textarea
                                    className="min-h-24 w-full rounded-lg border bg-transparent p-2 text-sm"
                                    placeholder="Contoh: Gratis domain .com, .id, atau ekstensi lainnya."
                                    maxLength={500}
                                    value={card.details ?? ''}
                                    onChange={(e) =>
                                        setData(
                                            'package_cards',
                                            data.package_cards.map(
                                                (item, itemIndex) =>
                                                    itemIndex === index
                                                        ? {
                                                              ...item,
                                                              details:
                                                                  e.target
                                                                      .value,
                                                          }
                                                        : item,
                                            ),
                                        )
                                    }
                                />
                            </Field>
                        </div>
                    ))}
                </div>
                <Button disabled={processing}>Simpan</Button>
            </form>
        </>
    );
}
function Field({ label, error, children }) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}
SettingsEdit.layout = {
    breadcrumbs: [{ title: 'Settings', href: '/admin/settings' }],
};
