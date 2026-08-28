import { usePage, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PublicLayout from '@/layouts/public-layout';

export default function OrderStatus({ order }) {
    const { flash = {} } = usePage().props;
    const { data, setData, post, processing } = useForm({ order_number: flash.order_number ?? '', client_email: '' });
    function submit(e) { e.preventDefault(); post('/cek-status-pesanan'); }
    return <PublicLayout title="Cek Status Pesanan"><div className="mx-auto max-w-2xl px-4 py-12"><h1 className="mb-4 text-3xl font-semibold">Cek Status Pesanan</h1>{flash.order_number && <p className="mb-4 rounded-lg border p-3">Nomor order kamu: <b>{flash.order_number}</b></p>}<form onSubmit={submit} className="space-y-3"><Input placeholder="Order number" value={data.order_number} onChange={(e) => setData('order_number', e.target.value)} required /><Input type="email" placeholder="Email" value={data.client_email} onChange={(e) => setData('client_email', e.target.value)} required /><Button disabled={processing}>Cek</Button></form>{order && <div className="mt-6 rounded-xl border p-5"><p>Status: <b>{order.status}</b></p><p>Tipe: {order.order_type}</p><p>Catatan admin: {order.admin_notes ?? '-'}</p></div>}{order === null && <p className="mt-4 text-sm text-muted-foreground">Pesanan tidak ditemukan.</p>}</div></PublicLayout>;
}
