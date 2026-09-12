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
    createdBy: number;
}) => {
    return prisma.course.create({
        data,
    });
};

export const updateCourse = async (
    id: number,
    data: {
        courseCode?: string;
        title?: string;
        description?: string;
        credits?: number;
        department?: string;
        isbn?: string;
    }
) => {
    return prisma.course.update({
        where: {
            id,
        },
        data,
    });
};

export const deleteCourse = async (id: number) => {
    return prisma.course.delete({
        where: {
            id,
        },
    });
};