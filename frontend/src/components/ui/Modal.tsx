import type { ReactNode } from "react";
import { X } from "lucide-react";

export const Modal = ({
    title,
    onClose,
    children,
}: {
    title: string;
    onClose: () => void;
    children: ReactNode;
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/30 px-4">
        <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-900">
                    {title}
                </h2>
                <button
                    onClick={onClose}
                    className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                >
                    <X size={16} />
                </button>
            </div>
            {children}
        </div>
    </div>
);

export const Field = ({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) => (
    <label className="block">
        <span className="mb-1 block text-xs font-medium text-zinc-600">
            {label}
        </span>
        {children}
    </label>
);

export const inputClass =
    "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none";
