import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Layers, BookImage } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import type { Course, TextbookInfo } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Modal, Field, inputClass } from "../../components/ui/Modal";

interface CourseForm {
    courseCode: string;
    title: string;
    description: string;
    credits: string;
    department: string;
    isbn: string;
}

const emptyForm: CourseForm = {
    courseCode: "",
    title: "",
    description: "",
    credits: "3",
    department: "",
    isbn: "",
};

export const ManageCoursesPage = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Course | null | "new">(null);
    const [form, setForm] = useState<CourseForm>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [lookingUp, setLookingUp] = useState(false);
    const [textbookPreview, setTextbookPreview] =
        useState<TextbookInfo | null>(null);
    const [error, setError] = useState<string | null>(null);

    const load = () => {
        setLoading(true);
        api.get<{ data: Course[] }>("/api/courses")
            .then((res) => setCourses(res.data))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const visibleCourses =
        user?.role === "ADMIN"
            ? courses
            : courses.filter((c) => c.createdBy === user?.id);

    const openCreate = () => {
        setForm(emptyForm);
        setTextbookPreview(null);
        setError(null);
        setEditing("new");
    };

    const openEdit = (course: Course) => {
        setForm({
            courseCode: course.courseCode,
            title: course.title,
            description: course.description || "",
            credits: String(course.credits),
            department: course.department,
            isbn: course.isbn || "",
        });
        setTextbookPreview(course.textbookInfo);
        setError(null);
        setEditing(course);
    };

    const handleTextbookLookup = async () => {
        setLookingUp(true);
        setTextbookPreview(null);
        setError(null);

        try {
            const response = await api.get<{ data: TextbookInfo }>(
                `/api/courses/textbooks/lookup?isbn=${encodeURIComponent(form.isbn)}`
            );
            setTextbookPreview(response.data);
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.message
                    : "Unable to look up this textbook"
            );
        } finally {
            setLookingUp(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);

        const payload = {
            courseCode: form.courseCode,
            title: form.title,
            description: form.description || undefined,
            credits: Number(form.credits),
            department: form.department,
            isbn: form.isbn.trim() || null,
        };

        try {
            if (editing === "new") {
                await api.post("/api/courses", payload);
            } else if (editing) {
                await api.put(`/api/courses/${editing.id}`, payload);
            }

            setEditing(null);
            load();
        } catch (err) {
            setError(
                err instanceof ApiError ? err.message : "Failed to save course"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (course: Course) => {
        if (!confirm(`Delete ${course.courseCode}? This cannot be undone.`)) {
            return;
        }

        await api.delete(`/api/courses/${course.id}`);
        load();
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
                        {user?.role === "ADMIN" ? "Courses" : "My Courses"}
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        Create courses and manage their sections.
                    </p>
                </div>
                <Button onClick={openCreate}>
                    <Plus size={15} />
                    New Course
                </Button>
            </div>

            {loading ? (
                <p className="text-sm text-zinc-500">Loading...</p>
            ) : visibleCourses.length === 0 ? (
                <div className="flex flex-col items-center rounded-xl border border-dashed border-zinc-200 py-16 text-center">
                    <BookImage size={20} className="mb-3 text-zinc-300" />
                    <p className="text-sm font-medium text-zinc-700">
                        No courses yet
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                        Create your first course to get started.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {visibleCourses.map((course) => (
                        <div
                            key={course.id}
                            className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4"
                        >
                            <div className="min-w-0">
                                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                                    {course.courseCode} &middot;{" "}
                                    {course.department}
                                </p>
                                <p className="mt-0.5 truncate text-sm font-semibold text-zinc-900">
                                    {course.title}
                                </p>
                                {course.textbookInfo && (
                                    <p className="mt-0.5 text-xs text-zinc-400">
                                        Textbook: {course.textbookInfo.title}
                                    </p>
                                )}
                            </div>

                            <div className="flex shrink-0 items-center gap-1.5">
                                <Link to={`/manage/courses/${course.id}/sections`}>
                                    <Button variant="secondary">
                                        <Layers size={14} />
                                        Sections
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    onClick={() => openEdit(course)}
                                >
                                    <Pencil size={14} />
                                </Button>
                                {user?.role === "ADMIN" && (
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleDelete(course)}
                                    >
                                        <Trash2
                                            size={14}
                                            className="text-red-500"
                                        />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editing && (
                <Modal
                    title={editing === "new" ? "New Course" : "Edit Course"}
                    onClose={() => setEditing(null)}
                >
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Course Code">
                                <input
                                    className={inputClass}
                                    value={form.courseCode}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            courseCode: e.target.value,
                                        })
                                    }
                                    placeholder="CS250"
                                />
                            </Field>
                            <Field label="Department">
                                <input
                                    className={inputClass}
                                    value={form.department}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            department: e.target.value,
                                        })
                                    }
                                    placeholder="CS"
                                />
                            </Field>
                        </div>

                        <Field label="Title">
                            <input
                                className={inputClass}
                                value={form.title}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        title: e.target.value,
                                    })
                                }
                                placeholder="Software Engineering Practices"
                            />
                        </Field>

                        <Field label="Description">
                            <textarea
                                className={inputClass}
                                rows={2}
                                value={form.description}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        description: e.target.value,
                                    })
                                }
                            />
                        </Field>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Credits">
                                <input
                                    type="number"
                                    className={inputClass}
                                    value={form.credits}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            credits: e.target.value,
                                        })
                                    }
                                />
                            </Field>
                            <Field label="Textbook ISBN (optional)">
                                <div className="flex gap-2">
                                    <input
                                        className={inputClass}
                                        value={form.isbn}
                                        onChange={(e) => {
                                            setForm({
                                                ...form,
                                                isbn: e.target.value,
                                            });
                                            setTextbookPreview(null);
                                        }}
                                        placeholder="9780132350884"
                                    />
                                    <Button
                                        variant="secondary"
                                        onClick={handleTextbookLookup}
                                        disabled={
                                            lookingUp || !form.isbn.trim()
                                        }
                                    >
                                        {lookingUp ? "Looking..." : "Look up"}
                                    </Button>
                                </div>
                            </Field>
                        </div>

                        {textbookPreview && (
                            <div className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                                {textbookPreview.coverUrl ? (
                                    <img
                                        src={textbookPreview.coverUrl}
                                        alt={textbookPreview.title}
                                        className="h-20 w-14 shrink-0 rounded object-cover"
                                    />
                                ) : (
                                    <div className="flex h-20 w-14 shrink-0 items-center justify-center rounded bg-white">
                                        <BookImage
                                            size={18}
                                            className="text-zinc-300"
                                        />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                                        Open Library match
                                    </p>
                                    <p className="mt-0.5 text-sm font-semibold text-zinc-900">
                                        {textbookPreview.title}
                                    </p>
                                    {textbookPreview.authors.length > 0 && (
                                        <p className="text-xs text-zinc-600">
                                            {textbookPreview.authors.join(", ")}
                                        </p>
                                    )}
                                    {(textbookPreview.edition ||
                                        textbookPreview.publishYear) && (
                                        <p className="mt-1 text-xs text-zinc-500">
                                            {[
                                                textbookPreview.edition,
                                                textbookPreview.publishYear,
                                            ]
                                                .filter(Boolean)
                                                .join(" · ")}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {error && (
                            <p className="text-sm text-red-600">{error}</p>
                        )}

                        <div className="flex justify-end gap-2 pt-1">
                            <Button
                                variant="secondary"
                                onClick={() => setEditing(null)}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={saving}>
                                {saving
                                    ? form.isbn.trim()
                                        ? "Saving & looking up..."
                                        : "Saving..."
                                    : "Save"}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
