import { prisma } from "../config/prisma";

export const getAllSemesters = async () => {
    return prisma.semester.findMany({
        orderBy: {
            startDate: "asc",
        },
    });
};

export const getSemesterById = async (id: number) => {
    return prisma.semester.findUnique({
        where: { id },
    });
};

export const createSemester = async (data: {
    name: string;
    startDate: Date;
    endDate: Date;
}) => {
    return prisma.semester.create({
        data,
    });
};

export const updateSemester = async (
    id: number,
    data: {
        name?: string | undefined;
        startDate?: Date | undefined;
        endDate?: Date | undefined;
    }
) => {
    const updateData = Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined)
    );

    return prisma.semester.update({
        where: { id },
        data: updateData,
    });
};

export const deleteSemester = async (id: number) => {
    return prisma.semester.delete({
        where: { id },
    });
};
