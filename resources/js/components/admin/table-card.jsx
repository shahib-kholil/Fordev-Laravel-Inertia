import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function AdminTableCard({ toolbar, children, pagination }) {
    return (
        <Card>
            {toolbar && <CardHeader>{toolbar}</CardHeader>}
            <CardContent className="overflow-x-auto px-0">
                {children}
            </CardContent>
            {pagination && <div className="border-t px-4 py-3">{pagination}</div>}
        </Card>
    );
}

export function AdminTable({ children }) {
    return <table className="w-full min-w-[640px] text-sm">{children}</table>;
}

export function AdminActions({ children }) {
    return <div className="flex justify-end gap-2">{children}</div>;
}
