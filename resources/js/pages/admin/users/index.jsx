import { Head, router } from '@inertiajs/react';
import AdminSearch from '@/components/admin-search';
import { AdminPageShell } from '@/components/admin/page-shell';
import { AdminTable, AdminTableCard } from '@/components/admin/table-card';
import Pagination from '@/components/pagination';

export default function UsersIndex({ users, filters, roles }) {
    return (
        <>
            <Head title="Kelola User" />
            <AdminPageShell
                title="Kelola User"
                description="Kelola akun dan role akses pengguna."
            >
                <AdminTableCard
                    toolbar={
                        <AdminSearch
                            action="/admin/users"
                            defaultValue={filters.q}
                            placeholder="Cari nama/email..."
                        />
                    }
                    pagination={<Pagination links={users.links} />}
                >
                    <AdminTable>
                        <thead className="bg-muted/60 text-left">
                            <tr>
                                <th className="p-3">User</th>
                                <th className="p-3">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.map((user) => (
                                <tr key={user.id} className="border-t">
                                    <td className="p-3">
                                        <div className="font-medium">
                                            {user.name}
                                        </div>
                                        <div className="text-muted-foreground">
                                            {user.email}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <select
                                            className="h-9 rounded-lg border bg-background px-2 text-sm"
                                            value={user.role}
                                            onChange={(e) =>
                                                router.put(
                                                    `/admin/users/${user.id}`,
                                                    { role: e.target.value },
                                                    { preserveScroll: true },
                                                )
                                            }
                                        >
                                            {roles.map((role) => (
                                                <option key={role} value={role}>
                                                    {role}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </AdminTable>
                </AdminTableCard>
            </AdminPageShell>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [{ title: 'Kelola User', href: '/admin/users' }],
};
