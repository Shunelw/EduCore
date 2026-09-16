import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Plus,
    Pencil,
    Trash2,
    Users,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { api, ApiError } from "../../lib/api";
import type { AdminUser, Course, Section, Semester } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Modal, Field, inputClass } from "../../components/ui/Modal";

interface SectionForm {
    semesterId: string;
    professorId: string;
    capacity: string;
    schedule: string;
}

export const ManageSectionsPage = () => {
    const { id } = useParams();
    const courseId = Number(id);
    const { user } = useAuth();

    const [course, setCourse] = useState<Course | null>(null);
    const [sections, setSections] = useState<Section[]>([]);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [professors, setProfessors] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [editing, setEditing] = useState<Section | null | "new">(null);
    const [form, setForm] = useState<SectionForm>({
        semesterId: "",
        professorId: String(user?.id || ""),
        capacity: "30",
        schedule: "",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = () => {
        setLoading(true);

        const requests: Promise<unknown>[] = [
            api.get<{ data: Course }>(`/api/courses/${courseId}`),
            api.get<{ data: Section[] }>("/api/sections"),
            api.get<{ data: Semester[] }>("/api/semesters"),
        ];

        if (user?.role === "ADMIN") {
            requests.push(api.get<{ data: AdminUser[] }>("/api/admin/users"));
        }

        Promise.all(requests)
            .then((results) => {
                const [courseRes, sectionRes, semesterRes, usersRes] =
                    results as [
                        { data: Course },
                        { data: Section[] },
                        { data: Semester[] },
                        { data: AdminUser[] }?,
                    ];

                setCourse(courseRes.data);
                setSections(
                    sectionRes.data.filter((s) => s.courseId === courseId)
                );
                setSemesters(semesterRes.data);

                if (usersRes) {
                    setProfessors(
                        usersRes.data.filter(
                            (u) => u.role.roleName === "PROFESSOR"
                        )
                    );
                }
            })
            .finally(() => setLoading(false));
    };

    useEffect(load, [courseId]);

    const openCreate = () => {
        setForm({
            semesterId: semesters[0] ? String(semesters[0].id) : "",
            professorId: String(user?.id || ""),
            capacity: "30",
            schedule: "",
        });
        setEditing("new");
    };

    const openEdit = (section: Section) => {
        setForm({
            semesterId: String(section.semesterId),
            professorId: String(section.professorId),
            capacity: String(section.capacity),
            schedule: section.schedule,
        });
        setEditing(section);
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);

        const payload = {
            courseId,
            semesterId: Number(form.semesterId),
            professorId: Number(form.professorId),
            capacity: Number(form.capacity),
            schedule: form.schedule,
        };

        try {
            if (editing === "new") {
                await api.post("/api/sections", payload);
            } else if (editing) {
                await api.put(`/api/sections/${editing.id}`, payload);
            }

            setEditing(null);
            load();
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.message
                    : "Failed to save section"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (section: Section) => {
        if (!confirm("Delete this section? This cannot be undone.")) {
            return;
        }

        await api.delete(`/api/sections/${section.id}`);
        load();
    };

    const toggleExpand = async (sectionId: number) => {
        if (expandedId === sectionId) {
            setExpandedId(null);
            return;
        }

        setExpandedId(sectionId);

        const res = await api.get<{ data: Section }>(
            `/api/sections/${sectionId}`
        );

        setSections((prev) =>
            prev.map((s) => (s.id === sectionId ? res.data : s))
        );
    };

    if (loading) {
        return <p className="text-sm text-zinc-500">Loading...</p>;
    }

    return (
        <div>
            <Link
                to="/manage/courses"
                className="mb-5 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800"
            >
                <ArrowLeft size={14} />
                Back to courses
            </Link>

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
                        {course?.courseCode} Sections
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        {course?.title}
                    </p>
                </div>
                <Button onClick={openCreate} disabled={semesters.length === 0}>
                    <Plus size={15} />
                    New Section
                </Button>
            </div>

            {semesters.length === 0 && (
                <p className="mb-4 text-sm text-amber-600">
                    No semesters exist yet — ask an admin to create one before
                    adding sections.
                </p>
            )}

            {sections.length === 0 ? (
                <p className="text-sm text-zinc-500">
                    No sections yet for this course.
                </p>
            ) : (
                <div className="space-y-2">
                    {sections.map((section) => {
                        const enrolled = section._count?.enrollments ?? 0;
                        const isExpanded = expandedId === section.id;

                        return (
                            <div
                                key={section.id}
                                className="rounded-xl border border-zinc-200 bg-white"
                            >
                                <div className="flex items-center justify-between gap-4 p-4">
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900">
                                            {section.schedule}
                                        </p>
                                        <p className="mt-1 text-xs text-zinc-500">
                                            {section.semester?.name} &middot;{" "}
                                            {section.professor?.name} &middot;{" "}
                                            {enrolled}/{section.capacity}{" "}
                                            enrolled
                                        </p>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-1.5">
                                        <Button
                                            variant="secondary"
                                            onClick={() =>
                                                toggleExpand(section.id)
                                            }
                                        >
                                            <Users size={14} />
                                            Students
                                            {isExpanded ? (
                                                <ChevronUp size={14} />
                                            ) : (
                                                <ChevronDown size={14} />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => openEdit(section)}
                                        >
                                            <Pencil size={14} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() =>
                                                handleDelete(section)
                                            }
                                        >
                                            <Trash2
                                                size={14}
                                                className="text-red-500"
                                            />
                                        </Button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="border-t border-zinc-100 px-4 py-3">
                                        {!section.enrollments ||
                                        section.enrollments.length === 0 ? (
                                            <p className="text-sm text-zinc-400">
                                                No students enrolled yet.
                                            </p>
                                        ) : (
                                            <ul className="space-y-1.5">
                                                {section.enrollments.map(
                                                    (e) => (
                                                        <li
                                                            key={e.id}
                                                            className="flex items-center justify-between text-sm"
                                                        >
                                                            <span className="text-zinc-800">
                                                                {
                                                                    e.student
                                                                        .name
                                                                }
                                                            </span>
                                                            <span className="text-xs text-zinc-400">
                                                                {
                                                                    e.student
                                                                        .email
                                                                }
                                                            </span>
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {editing && (
                <Modal
                    title={editing === "new" ? "New Section" : "Edit Section"}
                    onClose={() => setEditing(null)}
                >
                    <div className="space-y-3">
                        <Field label="Semester">
                            <select
                                className={inputClass}
                                value={form.semesterId}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        semesterId: e.target.value,
                                    })
                                }
                            >
                                {semesters.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        {user?.role === "ADMIN" && (
                            <Field label="Professor">
                                <select
                                    className={inputClass}
                                    value={form.professorId}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            professorId: e.target.value,
                                        })
                                    }
                                >
                                    <option value={user.id}>
                                        {user.name} (me)
                                    </option>
                                    {professors
                                        .filter((p) => p.id !== user.id)
                                        .map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                </select>
                            </Field>
                        )}

                        <Field label="Schedule">
                            <input
                                className={inputClass}
                                value={form.schedule}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        schedule: e.target.value,
                                    })
                                }
                                placeholder="Mon/Wed 10:00-11:30"
                            />
                        </Field>

                        <Field label="Capacity">
                            <input
                                type="number"
                                className={inputClass}
                                value={form.capacity}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        capacity: e.target.value,
                                    })
                                }
                            />
                        </Field>

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
                                {saving ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
