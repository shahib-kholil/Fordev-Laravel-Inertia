import InputError from '@/components/input-error';

export default function Field({ label, error, children }) {
    return (
        <div className="grid gap-2 text-sm">
            <label className="font-medium">{label}</label>
            {children}
            <InputError message={error} />
        </div>
    );
}
