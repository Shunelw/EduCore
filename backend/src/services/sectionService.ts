import { prisma } from "../config/prisma";

export const getAllSections = async () => {
    return prisma.section.findMany({
        include: {
            course: true,
            semester: true,
            professor: true,
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
            enrollments: true,
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
        courseId?: number;
        semesterId?: number;
        professorId?: number;
        capacity?: number;
        schedule?: string;
    }
) => {
    return prisma.section.update({
        where: { id },
        data,
    });
};

export const deleteSection = async (id: number) => {
    return prisma.section.delete({
        where: { id },
    });
};