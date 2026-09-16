import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    BookOpen,
    ClipboardList,
    Users,
    CalendarRange,
    BarChart3,
    LogOut,
    GraduationCap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";

interface NavItem {
    to: string;
    label: string;
    icon: typeof BookOpen;
}

const navByRole: Record<Role, NavItem[]> = {
    STUDENT: [
        { to: "/courses", label: "Browse Courses", icon: BookOpen },
        { to: "/my-registrations", label: "My Registrations", icon: ClipboardList },
    ],
    PROFESSOR: [
        { to: "/manage/courses", label: "My Courses", icon: BookOpen },
    ],
    ADMIN: [
        { to: "/manage/courses", label: "Courses", icon: BookOpen },
        { to: "/admin/users", label: "Users", icon: Users },
        { to: "/admin/semesters", label: "Semesters", icon: CalendarRange },
        { to: "/admin/reports", label: "Enrollment Reports", icon: BarChart3 },
    ],
};

const roleLabel: Record<Role, string> = {
    STUDENT: "Student",
    PROFESSOR: "Professor",
    ADMIN: "Administrator",
};

export const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    const items = navByRole[user.role];

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="flex h-screen bg-zinc-50">
            <aside className="flex w-60 shrink-0 flex-col border-r border-zinc-200 bg-white">
                <div className="flex items-center gap-2 px-5 py-5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-white">
                        <GraduationCap size={16} strokeWidth={2} />
                    </div>
                    <span className="text-[15px] font-semibold tracking-tight text-zinc-900">
                        EduCore
                    </span>
                </div>

                <nav className="flex-1 space-y-0.5 px-3">
                    {items.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
                                    isActive
                                        ? "bg-zinc-100 text-zinc-900"
                                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                                }`
                            }
                        >
                            <item.icon size={16} strokeWidth={2} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="border-t border-zinc-100 p-3">
                    <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-zinc-900">
                                {user.name}
                            </p>
                            <p className="truncate text-xs text-zinc-500">
                                {roleLabel[user.role]}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Log out"
                            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                        >
                            <LogOut size={15} />
                        </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-5xl px-8 py-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
