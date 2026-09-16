import { prisma } from "../config/prisma";

export const getAllSections = async () => {
    return prisma.section.findMany({
        include: {
            course: true,
            semester: true,
            professor: true,
            _count: {
                select: {
                    enrollments: {
                        where: { status: "ACTIVE" },
                    },
                },
            },
        },
        orderBy: {
            id: "asc",
        },
    });
};

export const getSectionById = async (id: number) => {
    return prisma.section.findUnique({
        where: { id },
        include: {
            course: true,
            semester: true,
            professor: true,
            enrollments: {
                where: { status: "ACTIVE" },
                include: {
                    student: {
                        select: { id: true, name: true, email: true },
                    },
                },
            },
            _count: {
                select: {
                    enrollments: {
                        where: { status: "ACTIVE" },
                    },
                },
            },
        },
    });
};

export const createSection = async (data: {
    courseId: number;
    semesterId: number;
    professorId: number;
    capacity: number;
    schedule: string;
}) => {
    return prisma.section.create({
        data,
    });
};

export const updateSection = async (
    id: number,
    data: {
        courseId?: number | undefined;
        semesterId?: number | undefined;
        professorId?: number | undefined;
        capacity?: number | undefined;
        schedule?: string | undefined;
    }
) => {
    const updateData = Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined)
    );

    return prisma.section.update({
        where: { id },
        data: updateData,
    });
};

export const deleteSection = async (id: number) => {
    return prisma.section.delete({
        where: { id },
    });
};