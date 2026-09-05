import { Head, Link } from '@inertiajs/react';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    return (
        <>
            <Head title="Registration closed" />
            <div className="space-y-4 text-center">
                <h1 className="text-xl font-semibold">Registrasi ditutup</h1>
                <p className="text-sm text-muted-foreground">
                    © Created by For Developers.
                </p>
                <Link href="/login" className="text-sm underline">
                    Masuk
                </Link>
            </div>
        </>
    );
}

Register.layout = (page) => (
    <AuthLayout title="Registrasi ditutup">{page}</AuthLayout>
);
