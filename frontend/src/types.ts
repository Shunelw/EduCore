export type Role = "STUDENT" | "PROFESSOR" | "ADMIN";

export interface CurrentUser {
    id: number;
    name: string;
    email: string;
    department: string | null;
    role: Role;
}

export interface TextbookInfo {
    title: string;
    authors: string[];
    publishYear: string | null;
    coverUrl: string | null;
    edition: string | null;
}

export interface Course {
    id: number;
    courseCode: string;
    title: string;
    description: string | null;
    credits: number;
    department: string;
    isbn: string | null;
    textbookInfo: TextbookInfo | null;
    createdBy: number;
}

export interface Semester {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
}

export interface Section {
    id: number;
    courseId: number;
    semesterId: number;
    professorId: number;
    capacity: number;
    schedule: string;
    course?: Course;
    semester?: Semester;
    professor?: { id: number; name: string; email: string };
    _count?: { enrollments: number };
    enrollments?: {
        id: number;
        status: string;
        student: { id: number; name: string; email: string };
    }[];
}

export interface Enrollment {
    id: number;
    studentId: number;
    sectionId: number;
    status: "ACTIVE" | "DROPPED";
    createdAt: string;
    section?: Section;
    student?: { id: number; name: string; email: string };
}

export interface AdminUser {
    id: number;
    name: string;
    email: string;
    department: string | null;
    lastLoginAt: string | null;
    role: { id: number; roleName: Role };
}
