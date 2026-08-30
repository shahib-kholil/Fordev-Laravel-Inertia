import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ThemeToggle() {
    const [dark, setDark] = useState(false);

    useEffect(() => {
        if (typeof document === 'undefined') return;
        setDark(document.documentElement.classList.contains('dark'));
    }, []);

    function toggle() {
        if (typeof document === 'undefined') return;

        const next = !dark;
        const root = document.documentElement;
        const apply = () => root.classList.toggle('dark', next);

        if (document.startViewTransition) {
            document.startViewTransition(apply);
        } else {
            apply();
        }

        setDark(next);
    }

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={toggle}
            aria-label="Ganti tema"
        >
            {dark ? <Sun /> : <Moon />}
        </Button>
    );
}
