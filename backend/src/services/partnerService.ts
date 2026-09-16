import { prisma } from "../config/prisma";

export const verifyStudentByEmail = async (email: string) => {
    const student = await prisma.user.findUnique({
        where: {
            email: email.toLowerCase(),
        },
        include: {
            role: true,
            enrollments: true,
        },
    });

    if (!student || student.role.roleName !== "STUDENT") {
        return null;
    }

    const isEnrolled = student.enrollments.some(
        (enrollment) => enrollment.status === "ACTIVE"
    );

    return {
        department: student.department,
        isEnrolled,
    };
};
