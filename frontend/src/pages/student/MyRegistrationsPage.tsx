import { useEffect, useState } from "react";
import { ClipboardList, Calendar } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import type { Enrollment } from "../../types";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

export const MyRegistrationsPage = () => {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [droppingId, setDroppingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const load = () => {
        setLoading(true);
        api.get<{ data: Enrollment[] }>("/api/enrollments/me")
            .then((res) => setEnrollments(res.data))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const handleDrop = async (id: number) => {
        setError(null);
        setDroppingId(id);

        try {
            await api.delete(`/api/enrollments/${id}`);
            load();
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.message
                    : "Unable to drop this course"
            );
        } finally {
            setDroppingId(null);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
                    My Registrations
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                    Your registration history across all semesters.
                </p>
            </div>

            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <p className="text-sm text-zinc-500">Loading...</p>
            ) : enrollments.length === 0 ? (
                <div className="flex flex-col items-center rounded-xl border border-dashed border-zinc-200 py-16 text-center">
                    <ClipboardList size={20} className="mb-3 text-zinc-300" />
                    <p className="text-sm font-medium text-zinc-700">
                        No registrations yet
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                        Browse courses to register for a section.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {enrollments.map((enrollment) => {
                        const section = enrollment.section;
                        const course = section?.course;
                        const isActive = enrollment.status === "ACTIVE";

                        return (
                            <div
                                key={enrollment.id}
                                className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4"
                            >
                                <div>
                                    <p className="text-sm font-medium text-zinc-900">
                                        {course?.courseCode} &mdash;{" "}
                                        {course?.title}
                                    </p>
                                    <div className="mt-1.5 flex items-center gap-3 text-xs text-zinc-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {section?.schedule}
                                        </span>
                                        <span>&middot;</span>
                                        <span>{section?.semester?.name}</span>
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-3">
                                    <Badge
                                        tone={isActive ? "green" : "neutral"}
                                    >
                                        {isActive ? "Active" : "Dropped"}
                                    </Badge>
                                    {isActive && (
                                        <Button
                                            variant="secondary"
                                            disabled={
                                                droppingId === enrollment.id
                                            }
                                            onClick={() =>
                                                handleDrop(enrollment.id)
                                            }
                                        >
                                            {droppingId === enrollment.id
                                                ? "Dropping..."
                                                : "Drop"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
