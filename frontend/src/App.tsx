import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { HomePage } from "./pages/HomePage";
import { BrowseCoursesPage } from "./pages/student/BrowseCoursesPage";
import { CourseDetailPage } from "./pages/student/CourseDetailPage";
import { MyRegistrationsPage } from "./pages/student/MyRegistrationsPage";
import { ManageCoursesPage } from "./pages/manage/ManageCoursesPage";
import { ManageSectionsPage } from "./pages/manage/ManageSectionsPage";
import { UsersPage } from "./pages/admin/UsersPage";
import { SemestersPage } from "./pages/admin/SemestersPage";
import { EnrollmentReportsPage } from "./pages/admin/EnrollmentReportsPage";

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            <Route
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route path="/" element={<HomePage />} />

                <Route
                    path="/courses"
                    element={
                        <ProtectedRoute roles={["STUDENT"]}>
                            <BrowseCoursesPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/courses/:id"
                    element={
                        <ProtectedRoute roles={["STUDENT"]}>
                            <CourseDetailPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/my-registrations"
                    element={
                        <ProtectedRoute roles={["STUDENT"]}>
                            <MyRegistrationsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/manage/courses"
                    element={
                        <ProtectedRoute roles={["PROFESSOR", "ADMIN"]}>
                            <ManageCoursesPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/manage/courses/:id/sections"
                    element={
                        <ProtectedRoute roles={["PROFESSOR", "ADMIN"]}>
                            <ManageSectionsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute roles={["ADMIN"]}>
                            <UsersPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/semesters"
                    element={
                        <ProtectedRoute roles={["ADMIN"]}>
                            <SemestersPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/reports"
                    element={
                        <ProtectedRoute roles={["ADMIN"]}>
                            <EnrollmentReportsPage />
                        </ProtectedRoute>
                    }
                />
            </Route>
        </Routes>
    );
}

export default App;
