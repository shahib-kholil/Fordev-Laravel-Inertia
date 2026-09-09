import { useState } from 'react';
import { HelpCircle } from 'lucide-react';

export default function OrderSummary({ domain, name, bundle }) {
    const bundleDomains = bundle?.domains ?? [];
    const normalPrice = bundle
        ? bundleDomains.reduce(
              (sum, item) => sum + Number(item.promo_price || item.price),
              0,
          )
        : Number(domain.price);
    const price = bundle
        ? Number(bundle.price)
        : Number(domain.promo_price || normalPrice);
    const tax = Math.round(price * 0.11);
    const normalTax = Math.round(normalPrice * 0.11);
    const discounted = price < normalPrice;
    const [showTaxInfo, setShowTaxInfo] = useState(false);

    return (
        <aside className="h-fit rounded-2xl border-2 border-input bg-card p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Daftar pesanan</h2>
            <p className="mt-4 font-semibold">
                {bundle
                    ? `${name} (${bundleDomains.map((item) => item.extension).join(' + ')})`
                    : `${name}${domain.extension}`}
            </p>
            <div className="mt-5 space-y-3 text-sm">
                <SummaryLine
                    label="Registrasi domain – 1 tahun"
                    value={price}
                />
                {discounted && (
                    <div className="flex justify-between gap-3 text-xs text-muted-foreground">
                        <span>Harga normal</span>
                        <span className="line-through">
                            Rp {normalPrice.toLocaleString('id-ID')}
                        </span>
                    </div>
                )}
                <SummaryLine label="Proteksi Privasi Domain WHOIS" value={0} />
                <hr />
                <div className="relative">
                    <SummaryLine
                        label={
                            <span className="inline-flex items-center gap-1">
                                Pajak
                                <button
                                    type="button"
                                    aria-label="Informasi pajak"
                                    aria-expanded={showTaxInfo}
                                    onClick={() =>
                                        setShowTaxInfo((value) => !value)
                                    }
                                    className="rounded-full text-muted-foreground hover:text-foreground"
                                >
                                    <HelpCircle className="size-4" />
                                </button>
                            </span>
                        }
                        value={tax}
                    />
                    {showTaxInfo && (
                        <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                            Pajak sebesar 11% dihitung dari harga domain setelah
                            diskon.
                        </p>
                    )}
                </div>
                <hr />
                {discounted && (
                    <SummaryLine
                        label="Total sebelum diskon"
                        value={normalPrice + normalTax}
                        muted
                    />
                )}
                <SummaryLine label="Total" value={price + tax} strong />
            </div>
        </aside>
    );
}

function SummaryLine({ label, value, strong = false, muted = false }) {
    return (
        <div
            className={`flex justify-between gap-3 ${strong ? 'text-lg font-bold' : ''} ${muted ? 'text-sm text-muted-foreground line-through' : ''}`}
        >
            <span>{label}</span>
            <span>Rp {Number(value).toLocaleString('id-ID')}</span>
        </div>
    );
}
