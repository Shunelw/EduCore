import type { ReactNode } from "react";

const tones = {
    neutral: "bg-zinc-100 text-zinc-700",
    indigo: "bg-indigo-50 text-indigo-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
};

export const Badge = ({
    children,
    tone = "neutral",
}: {
    children: ReactNode;
    tone?: keyof typeof tones;
}) => (
    <span
        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
        {children}
    </span>
);
