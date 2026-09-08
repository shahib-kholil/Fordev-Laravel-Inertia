import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import PasskeyVerify from '@/components/passkey-verify';
import { useEffect, useRef, useState } from 'react';

export default function Login({
    status = null,
    canResetPassword = false,
    turnstileSiteKey = null,
}) {
    const [notice, setNotice] = useState('');
    const turnstileContainer = useRef(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('login_notice') === 'domain') {
            setNotice('Silakan login terlebih dahulu untuk memesan domain.');
        }

        if (!turnstileSiteKey || !turnstileContainer.current) {
            return;
        }

        const render = () => {
            if (!window.turnstile || !turnstileContainer.current) return;
            const widgetId = window.turnstile.render(
                turnstileContainer.current,
                { sitekey: turnstileSiteKey },
            );
            turnstileContainer.current.dataset.widgetId = widgetId;
        };
        const existingScript = document.querySelector(
            'script[src*="turnstile"]',
        );

        if (window.turnstile) {
            render();
        } else if (existingScript) {
            existingScript.addEventListener('load', render, { once: true });
        } else {
            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
            script.async = true;
            script.addEventListener('load', render, { once: true });
            document.head.appendChild(script);
        }

        return () => {
            const widgetId = turnstileContainer.current?.dataset.widgetId;
            if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
        };
    }, [turnstileSiteKey]);

    return (
        <>
            <Head title="Log in" />

            <PasskeyVerify />

            {notice && (
                <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                    {notice}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                onError={(errors) => {
                    if (errors['cf-turnstile-response']) {
                        turnstileContainer.current
                            ?.querySelectorAll(
                                'input[name="cf-turnstile-response"]',
                            )
                            .forEach((input) => input.remove());
                        window.turnstile?.reset(
                            turnstileContainer.current?.dataset.widgetId,
                        );
                    }
                }}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            Forgot your password?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            {turnstileSiteKey && (
                                <div className="flex justify-center">
                                    <div ref={turnstileContainer} />
                                </div>
                            )}
                            <InputError
                                message={errors['cf-turnstile-response']}
                            />

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>
                        </div>

                        <div className="flex items-center justify-center gap-1 text-center text-sm text-muted-foreground">
                            <span aria-hidden="true">©</span>
                            <span>Created by For Developers</span>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Log in to your account',
    description: 'Enter your email and password below to log in',
};
