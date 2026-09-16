import { prisma } from "../config/prisma";

// Also serves as simple system activity monitoring: most recently
// active users appear first.
export const getAllUsers = async () => {
    return prisma.user.findMany({
        include: {
            role: true,
        },
        orderBy: {
            lastLoginAt: "desc",
        },
    });
};

export const getUserById = async (id: number) => {
    return prisma.user.findUnique({
        where: { id },
        include: {
            role: true,
        },
    });
};

export const assignUserRole = async (id: number, roleName: string) => {
    const role = await prisma.role.findUnique({
        where: { roleName },
    });

    if (!role) {
        return null;
    }

    return prisma.user.update({
        where: { id },
        data: { roleId: role.id },
        include: {
            role: true,
        },
    });
};

export const getEnrollmentReport = async () => {
    return prisma.enrollment.findMany({
        include: {
            student: {
                select: { id: true, name: true, email: true },
            },
            section: {
                include: {
                    course: {
                        select: { courseCode: true, title: true },
                    },
                    semester: {
                        select: { name: true },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};
