import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookImage, Users, Calendar, Check } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import type { Course, Section } from "../../types";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

export const CourseDetailPage = () => {
    const { id } = useParams();
    const [course, setCourse] = useState<Course | null>(null);
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [registeringId, setRegisteringId] = useState<number | null>(null);
    const [registeredIds, setRegisteredIds] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);

    const load = () => {
        setLoading(true);
        Promise.all([
            api.get<{ data: Course }>(`/api/courses/${id}`),
            api.get<{ data: Section[] }>("/api/sections"),
        ])
            .then(([courseRes, sectionRes]) => {
                setCourse(courseRes.data);
                setSections(
                    sectionRes.data.filter(
                        (s) => s.courseId === Number(id)
                    )
                );
            })
            .finally(() => setLoading(false));
    };

    useEffect(load, [id]);

    const handleRegister = async (sectionId: number) => {
        setError(null);
        setRegisteringId(sectionId);

        try {
            await api.post("/api/enrollments", { sectionId });
            setRegisteredIds((prev) => [...prev, sectionId]);
            load();
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.message
                    : "Unable to register for this section"
            );
        } finally {
            setRegisteringId(null);
        }
    };

    if (loading) {
        return <p className="text-sm text-zinc-500">Loading...</p>;
    }

    if (!course) {
        return <p className="text-sm text-zinc-500">Course not found.</p>;
    }

    const info = course.textbookInfo;

    return (
        <div>
            <Link
                to="/courses"
                className="mb-5 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800"
            >
                <ArrowLeft size={14} />
                Back to courses
            </Link>

            <div className="mb-8">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                    {course.courseCode} &middot; {course.department}
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
                    {course.title}
                </h1>
                {course.description && (
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
                        {course.description}
                    </p>
                )}
                <p className="mt-3 text-sm text-zinc-500">
                    {course.credits} credits
                </p>
            </div>

            {info && (
                <div className="mb-8 flex gap-4 rounded-xl border border-zinc-200 bg-white p-4">
                    {info.coverUrl ? (
                        <img
                            src={info.coverUrl}
                            alt={info.title}
                            className="h-28 w-20 shrink-0 rounded-md object-cover shadow-sm"
                        />
                    ) : (
                        <div className="flex h-28 w-20 shrink-0 items-center justify-center rounded-md bg-zinc-100">
                            <BookImage size={20} className="text-zinc-300" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                            Required Textbook
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-900">
                            {info.title}
                        </p>
                        {info.authors.length > 0 && (
                            <p className="mt-0.5 text-sm text-zinc-500">
                                {info.authors.join(", ")}
                            </p>
                        )}
                        {info.publishYear && (
                            <p className="mt-0.5 text-xs text-zinc-400">
                                Published {info.publishYear}
                            </p>
                        )}
                    </div>
                </div>
            )}

            <h2 className="mb-3 text-sm font-semibold text-zinc-900">
                Sections
            </h2>

            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}

            {sections.length === 0 ? (
                <p className="text-sm text-zinc-500">
                    No sections are currently scheduled for this course.
                </p>
            ) : (
                <div className="space-y-2">
                    {sections.map((section) => {
                        const enrolled = section._count?.enrollments ?? 0;
                        const seatsLeft = section.capacity - enrolled;
                        const isFull = seatsLeft <= 0;
                        const justRegistered = registeredIds.includes(
                            section.id
                        );

                        return (
                            <div
                                key={section.id}
                                className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4"
                            >
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                                        <Calendar
                                            size={14}
                                            className="text-zinc-400"
                                        />
                                        {section.schedule}
                                    </div>
                                    <div className="mt-1.5 flex items-center gap-3 text-xs text-zinc-500">
                                        <span>
                                            {section.semester?.name}
                                        </span>
                                        <span>&middot;</span>
                                        <span>
                                            {section.professor?.name}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users size={12} />
                                            {enrolled}/{section.capacity}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-3">
                                    {isFull && (
                                        <Badge tone="amber">Full</Badge>
                                    )}
                                    {justRegistered ? (
                                        <Badge tone="green">
                                            <span className="flex items-center gap-1">
                                                <Check size={12} />
                                                Registered
                                            </span>
                                        </Badge>
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            disabled={
                                                isFull ||
                                                registeringId === section.id
                                            }
                                            onClick={() =>
                                                handleRegister(section.id)
                                            }
                                        >
                                            {registeringId === section.id
                                                ? "Registering..."
                                                : "Register"}
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
