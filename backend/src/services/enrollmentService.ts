import { prisma } from "../config/prisma";

export const createEnrollment = async ({
    studentId,
    sectionId,
}: {
    studentId: number;
    sectionId: number;
}) => {
    // 1. Check student
    const student = await prisma.user.findUnique({
        where: { id: studentId },
    });

    if (!student) {
        throw new Error("Student not found");
    }

    // 2. Check section
    const section = await prisma.section.findUnique({
        where: { id: sectionId },
    });

    if (!section) {
        throw new Error("Section not found");
    }

    // 3. Check duplicate enrollment
    const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
            studentId_sectionId: {
                studentId,
                sectionId,
            },
        },
    });

    if (existingEnrollment?.status === "ACTIVE") {
        throw new Error("Student is already enrolled in this section");
    }

    // 4. Check capacity
    const enrolledCount = await prisma.enrollment.count({
        where: {
            sectionId,
            status: "ACTIVE",
        },
    });

    if (enrolledCount >= section.capacity) {
        throw new Error("Section is full");
    }

    // 5. Create enrollment
    return prisma.enrollment.create({
        data: {
            studentId,
            sectionId,
            status: "ACTIVE",
        },
    });
};