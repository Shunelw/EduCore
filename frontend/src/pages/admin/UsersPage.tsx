import { useEffect, useState } from "react";
import { Users as UsersIcon } from "lucide-react";
import { api } from "../../lib/api";
import type { AdminUser, Role } from "../../types";
import { Badge } from "../../components/ui/Badge";

const roleTone: Record<Role, "indigo" | "green" | "amber"> = {
    STUDENT: "indigo",
    PROFESSOR: "green",
    ADMIN: "amber",
};

const formatDate = (value: string | null) => {
    if (!value) return "Never";
    return new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
};

export const UsersPage = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const load = () => {
        setLoading(true);
        api.get<{ data: AdminUser[] }>("/api/admin/users")
            .then((res) => setUsers(res.data))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const handleRoleChange = async (userId: number, roleName: string) => {
        setUpdatingId(userId);

        try {
            await api.put(`/api/admin/users/${userId}/role`, { roleName });
            load();
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
                    Users
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                    Manage roles and view recent activity, most active first.
                </p>
            </div>

            {loading ? (
                <p className="text-sm text-zinc-500">Loading...</p>
            ) : users.length === 0 ? (
                <div className="flex flex-col items-center rounded-xl border border-dashed border-zinc-200 py-16 text-center">
                    <UsersIcon size={20} className="mb-3 text-zinc-300" />
                    <p className="text-sm font-medium text-zinc-700">
                        No users yet
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-zinc-100 text-xs uppercase tracking-wide text-zinc-400">
                                <th className="px-4 py-3 font-medium">
                                    Name
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Department
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Role
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Last Active
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr
                                    key={u.id}
                                    className="border-b border-zinc-50 last:border-0"
                                >
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-zinc-900">
                                            {u.name}
                                        </p>
                                        <p className="text-xs text-zinc-400">
                                            {u.email}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-600">
                                        {u.department || "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                tone={roleTone[u.role.roleName]}
                                            >
                                                {u.role.roleName}
                                            </Badge>
                                            <select
                                                className="rounded-md border border-zinc-200 bg-white px-1.5 py-1 text-xs text-zinc-600 focus:outline-none disabled:opacity-50"
                                                value={u.role.roleName}
                                                disabled={
                                                    updatingId === u.id
                                                }
                                                onChange={(e) =>
                                                    handleRoleChange(
                                                        u.id,
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="STUDENT">
                                                    Student
                                                </option>
                                                <option value="PROFESSOR">
                                                    Professor
                                                </option>
                                                <option value="ADMIN">
                                                    Admin
                                                </option>
                                            </select>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-zinc-500">
                                        {formatDate(u.lastLoginAt)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
