import { prisma } from "../config/prisma";

export const verifyStudentByEmail = async (email: string) => {
    const student = await prisma.user.findUnique({
        where: {
            email: email.trim().toLowerCase(),
        },
        select: {
            department: true,
            role: {
                select: { roleName: true },
            },
            enrollments: {
                where: { status: "ACTIVE" },
                select: { id: true },
                take: 1,
            },
        },
    });

    if (!student || student.role.roleName !== "STUDENT") {
        return null;
    }

    const department = student.department?.trim() || null;

    return {
        department,
        departmentConfigured: department !== null,
        isEnrolled: student.enrollments.length > 0,
    };
};
