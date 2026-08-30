import InputError from '@/components/input-error';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export function AdminFormCard({ title, description, children, footer }) {
    return (
        <Card className="max-w-3xl">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && (
                    <CardDescription>{description}</CardDescription>
                )}
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {children}
            </CardContent>
            {footer && <CardFooter className="gap-2">{footer}</CardFooter>}
        </Card>
    );
}

export function AdminField({ label, error, children }) {
    return (
        <div className="flex flex-col gap-2">
            <Label>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}
