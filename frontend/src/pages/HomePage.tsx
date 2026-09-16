import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const defaultPath: Record<string, string> = {
    STUDENT: "/courses",
    PROFESSOR: "/manage/courses",
    ADMIN: "/manage/courses",
};

export const HomePage = () => {
    const { user } = useAuth();

    if (!user) return null;

    return <Navigate to={defaultPath[user.role]} replace />;
};
