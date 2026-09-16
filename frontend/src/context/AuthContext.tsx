import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import { api } from "../lib/api";
import type { CurrentUser } from "../types";

interface AuthContextValue {
    user: CurrentUser | null;
    loading: boolean;
    setToken: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUser = useCallback(async () => {
        const token = localStorage.getItem("educore_token");

        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const me = await api.get<CurrentUser>("/api/auth/me");
            setUser(me);
        } catch {
            localStorage.removeItem("educore_token");
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const setToken = (token: string) => {
        localStorage.setItem("educore_token", token);
        setLoading(true);
        loadUser();
    };

    const logout = () => {
        localStorage.removeItem("educore_token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, setToken, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);

    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return ctx;
};
