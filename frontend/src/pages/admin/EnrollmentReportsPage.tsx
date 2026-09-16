import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { api } from "../../lib/api";
import type { Enrollment } from "../../types";
import { Badge } from "../../components/ui/Badge";

const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

export const EnrollmentReportsPage = () => {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<{ data: Enrollment[] }>("/api/admin/reports/enrollments")
            .then((res) => setEnrollments(res.data))
            .finally(() => setLoading(false));
    }, []);

    const activeCount = enrollments.filter(
        (e) => e.status === "ACTIVE"
    ).length;

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
                    Enrollment Reports
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                    {enrollments.length} total enrollments &middot;{" "}
                    {activeCount} active
                </p>
            </div>

            {loading ? (
                <p className="text-sm text-zinc-500">Loading...</p>
            ) : enrollments.length === 0 ? (
                <div className="flex flex-col items-center rounded-xl border border-dashed border-zinc-200 py-16 text-center">
                    <BarChart3 size={20} className="mb-3 text-zinc-300" />
                    <p className="text-sm font-medium text-zinc-700">
                        No enrollments yet
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-zinc-100 text-xs uppercase tracking-wide text-zinc-400">
                                <th className="px-4 py-3 font-medium">
                                    Student
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Course
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Semester
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Status
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {enrollments.map((e) => (
                                <tr
                                    key={e.id}
                                    className="border-b border-zinc-50 last:border-0"
                                >
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-zinc-900">
                                            {e.student?.name}
                                        </p>
                                        <p className="text-xs text-zinc-400">
                                            {e.student?.email}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-600">
                                        {e.section?.course?.courseCode}
                                        <span className="ml-1 text-xs text-zinc-400">
                                            {e.section?.course?.title}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-600">
                                        {e.section?.semester?.name}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            tone={
                                                e.status === "ACTIVE"
                                                    ? "green"
                                                    : "neutral"
                                            }
                                        >
                                            {e.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-zinc-500">
                                        {formatDate(e.createdAt)}
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
