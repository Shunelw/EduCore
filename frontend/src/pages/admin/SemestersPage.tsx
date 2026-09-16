import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, CalendarRange } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import type { Semester } from "../../types";
import { Button } from "../../components/ui/Button";
import { Modal, Field, inputClass } from "../../components/ui/Modal";

interface SemesterForm {
    name: string;
    startDate: string;
    endDate: string;
}

const emptyForm: SemesterForm = { name: "", startDate: "", endDate: "" };

const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

export const SemestersPage = () => {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Semester | null | "new">(null);
    const [form, setForm] = useState<SemesterForm>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = () => {
        setLoading(true);
        api.get<{ data: Semester[] }>("/api/semesters")
            .then((res) => setSemesters(res.data))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const openCreate = () => {
        setForm(emptyForm);
        setEditing("new");
    };

    const openEdit = (semester: Semester) => {
        setForm({
            name: semester.name,
            startDate: semester.startDate.slice(0, 10),
            endDate: semester.endDate.slice(0, 10),
        });
        setEditing(semester);
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);

        try {
            if (editing === "new") {
                await api.post("/api/semesters", form);
            } else if (editing) {
                await api.put(`/api/semesters/${editing.id}`, form);
            }

            setEditing(null);
            load();
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.message
                    : "Failed to save semester"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (semester: Semester) => {
        if (!confirm(`Delete ${semester.name}? This cannot be undone.`)) {
            return;
        }

        await api.delete(`/api/semesters/${semester.id}`);
        load();
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
                        Semesters
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        Manage academic terms available for scheduling
                        sections.
                    </p>
                </div>
                <Button onClick={openCreate}>
                    <Plus size={15} />
                    New Semester
                </Button>
            </div>

            {loading ? (
                <p className="text-sm text-zinc-500">Loading...</p>
            ) : semesters.length === 0 ? (
                <div className="flex flex-col items-center rounded-xl border border-dashed border-zinc-200 py-16 text-center">
                    <CalendarRange size={20} className="mb-3 text-zinc-300" />
                    <p className="text-sm font-medium text-zinc-700">
                        No semesters yet
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {semesters.map((semester) => (
                        <div
                            key={semester.id}
                            className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4"
                        >
                            <div>
                                <p className="text-sm font-medium text-zinc-900">
                                    {semester.name}
                                </p>
                                <p className="mt-0.5 text-xs text-zinc-500">
                                    {formatDate(semester.startDate)} &ndash;{" "}
                                    {formatDate(semester.endDate)}
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-1.5">
                                <Button
                                    variant="ghost"
                                    onClick={() => openEdit(semester)}
                                >
                                    <Pencil size={14} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleDelete(semester)}
                                >
                                    <Trash2
                                        size={14}
                                        className="text-red-500"
                                    />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editing && (
                <Modal
                    title={editing === "new" ? "New Semester" : "Edit Semester"}
                    onClose={() => setEditing(null)}
                >
                    <div className="space-y-3">
                        <Field label="Name">
                            <input
                                className={inputClass}
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                                placeholder="Fall 2026"
                            />
                        </Field>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Start Date">
                                <input
                                    type="date"
                                    className={inputClass}
                                    value={form.startDate}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            startDate: e.target.value,
                                        })
                                    }
                                />
                            </Field>
                            <Field label="End Date">
                                <input
                                    type="date"
                                    className={inputClass}
                                    value={form.endDate}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            endDate: e.target.value,
                                        })
                                    }
                                />
                            </Field>
                        </div>

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
