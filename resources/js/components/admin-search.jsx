import { router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';

export default function AdminSearch({ action, defaultValue = '', placeholder = 'Cari...' }) {
    function submit(e) {
        e.preventDefault();
        router.get(action, { q: e.currentTarget.q.value }, { preserveState: true });
    }

    return (
        <form onSubmit={submit} className="max-w-sm">
            <Input name="q" defaultValue={defaultValue ?? ''} placeholder={placeholder} />
        </form>
    );
}
