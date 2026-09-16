import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, BookOpen, ArrowRight } from "lucide-react";
import { api } from "../../lib/api";
import type { Course } from "../../types";

export const BrowseCoursesPage = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<{ data: Course[] }>("/api/courses")
            .then((res) => setCourses(res.data))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();

        if (!q) return courses;

        return courses.filter(
            (course) =>
                course.title.toLowerCase().includes(q) ||
                course.courseCode.toLowerCase().includes(q) ||
                course.department.toLowerCase().includes(q)
        );
    }, [courses, query]);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
                    Browse Courses
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                    Search and register for available courses.
                </p>
            </div>

            <div className="relative mb-6 max-w-sm">
                <Search
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by title, code, or department"
                    className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
                />
            </div>

            {loading ? (
                <p className="text-sm text-zinc-500">Loading courses...</p>
            ) : filtered.length === 0 ? (
                <EmptyState query={query} />
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {filtered.map((course) => (
                        <Link
                            key={course.id}
                            to={`/courses/${course.id}`}
                            className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                                        {course.courseCode}
                                    </p>
                                    <h3 className="mt-0.5 text-sm font-semibold text-zinc-900">
                                        {course.title}
                                    </h3>
                                </div>
                                <ArrowRight
                                    size={15}
                                    className="mt-1 shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-500"
                                />
                            </div>

                            {course.description && (
                                <p className="mt-2 line-clamp-2 text-sm text-zinc-500">
                                    {course.description}
                                </p>
                            )}

                            <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
                                <span>{course.department}</span>
                                <span>&middot;</span>
                                <span>{course.credits} credits</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

const EmptyState = ({ query }: { query: string }) => (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-zinc-200 py-16 text-center">
        <BookOpen size={20} className="mb-3 text-zinc-300" />
        <p className="text-sm font-medium text-zinc-700">
            {query ? "No courses match your search" : "No courses available yet"}
        </p>
        <p className="mt-1 text-sm text-zinc-400">
            {query ? "Try a different keyword." : "Check back later."}
        </p>
    </div>
);
