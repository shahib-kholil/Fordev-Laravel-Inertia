import AppLayout from '@/layouts/app-layout';

export default function AdminLayout({ breadcrumbs = [], children }) {
    return <AppLayout breadcrumbs={breadcrumbs}>{children}</AppLayout>;
}
