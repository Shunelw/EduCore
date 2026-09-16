import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const AuthCallbackPage = () => {
    const [params] = useSearchParams();
    const { setToken } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const token = params.get("token");

        if (!token) {
            navigate("/login");
            return;
        }

        setToken(token);
        navigate("/");
    }, [params, setToken, navigate]);

    return (
        <div className="flex h-screen items-center justify-center text-sm text-zinc-500">
            Signing you in...
        </div>
    );
};
