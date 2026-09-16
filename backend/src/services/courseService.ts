import { prisma } from "../config/prisma";

export const getAllCourses = async () => {
    return prisma.course.findMany({
        orderBy: {
            courseCode: "asc",
        },
    });
};

export const getCourseById = async (id: number) => {
    return prisma.course.findUnique({
        where: {
            id,
        },
    });
};

export const createCourse = async (data: {
    courseCode: string;
    title: string;
    description?: string;
    credits: number;
    department: string;
    isbn?: string;
    textbookInfo?: object;
    createdBy: number;
}) => {
    return prisma.course.create({
        data,
    });
};

export const updateCourse = async (
    id: number,
    data: {
        courseCode?: string | undefined;
        title?: string | undefined;
        description?: string | undefined;
        credits?: number | undefined;
        department?: string | undefined;
        isbn?: string | undefined;
        textbookInfo?: object | undefined;
    }
) => {
    const updateData = Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined)
    );

    return prisma.course.update({
        where: {
            id,
        },
        data: updateData,
    });
};

export const deleteCourse = async (id: number) => {
    return prisma.course.delete({
        where: {
            id,
        },
    });
};