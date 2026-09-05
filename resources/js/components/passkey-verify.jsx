import { router } from '@inertiajs/react';
import { usePasskeyVerify } from '@laravel/passkeys/react';
import { KeyRound } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

function GoogleLogo() {
    return (
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
            <path
                fill="#4285F4"
                d="M21.35 12.27c0-.72-.06-1.41-.18-2.07H12v3.92h5.23a4.47 4.47 0 0 1-1.94 2.93v2.42h3.14c1.84-1.69 2.92-4.18 2.92-7.2Z"
            />
            <path
                fill="#34A853"
                d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.42c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.5A9.74 9.74 0 0 0 12 21.5Z"
            />
            <path
                fill="#FBBC05"
                d="M6.54 13.61A5.86 5.86 0 0 1 6.23 12c0-.56.1-1.1.31-1.61v-2.5H3.3A9.5 9.5 0 0 0 2.5 12c0 1.53.37 2.98 1 4.11l3.04-2.5Z"
            />
            <path
                fill="#EA4335"
                d="M12 6.36c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.46 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.7 5.39l3.24 2.5C7.31 8.08 9.46 6.36 12 6.36Z"
            />
        </svg>
    );
}

export default function PasskeyVerify({
    routes,
    label,
    loadingLabel,
    separator,
}) {
    const { verify, isLoading, error, isSupported } = usePasskeyVerify({
        ...(routes && {
            routes: {
                options: routes.options.url,
                submit: routes.submit.url,
            },
        }),
        onSuccess: (response) => {
            router.visit(response.redirect ?? '/dashboard');
        },
    });

    if (!isSupported) {
        return null;
    }

    return (
        <>
            <div className="grid gap-3 sm:grid-cols-2">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={verify}
                    disabled={isLoading}
                >
                    {isLoading ? <Spinner /> : <KeyRound className="h-4 w-4" />}
                    {isLoading
                        ? (loadingLabel ?? 'Authenticating...')
                        : (label ?? 'Sign in with a passkey')}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    asChild
                    className="w-full border-[#4285f4]/60 bg-white text-[#1f1f1f] hover:bg-[#f8faff] hover:text-[#1f1f1f] dark:border-[#4285f4]/60 dark:bg-white dark:text-[#1f1f1f] dark:hover:bg-[#f8faff]"
                >
                    <a href="/auth/google/redirect">
                        <GoogleLogo />
                        Masuk dengan Google
                    </a>
                </Button>
                {error && (
                    <InputError message={error} className="text-center" />
                )}
            </div>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        {separator ?? 'Or continue with email'}
                    </span>
                </div>
            </div>
        </>
    );
}
