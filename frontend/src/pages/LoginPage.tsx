import { GraduationCap } from "lucide-react";
import { loginUrl } from "../lib/api";

export const LoginPage = () => (
    <div className="flex h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="w-full max-w-sm">
            <div className="mb-8 flex flex-col items-center text-center">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 text-white">
                    <GraduationCap size={22} strokeWidth={2} />
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
                    EduCore
                </h1>
                <p className="mt-1.5 text-sm text-zinc-500">
                    University course registration
                </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="mb-5 text-center text-sm text-zinc-500">
                    Sign in with your university Microsoft account to
                    continue.
                </p>

                <a
                    href={loginUrl()}
                    className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50"
                >
                    <MicrosoftLogo />
                    Continue with Microsoft
                </a>
            </div>
        </div>
    </div>
);

const MicrosoftLogo = () => (
    <svg width="16" height="16" viewBox="0 0 21 21" aria-hidden="true">
        <rect x="1" y="1" width="9" height="9" fill="#f25022" />
        <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
        <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
        <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
);
