import type { ButtonHTMLAttributes } from "react";

const variants = {
    primary:
        "bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-300",
    secondary:
        "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50 disabled:opacity-50",
    danger: "bg-red-600 text-white hover:bg-red-500 disabled:bg-red-300",
    ghost: "text-zinc-600 hover:bg-zinc-100 disabled:opacity-50",
};

export const Button = ({
    variant = "primary",
    className = "",
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: keyof typeof variants;
}) => (
    <button
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
        {...props}
    />
);
