import { Request, Response } from "express";
import { createEnrollment } from "../services/enrollmentService";

export const registerStudent = async (
    req: Request,
    res: Response
) => {
    try {
        const { studentId, sectionId } = req.body;

        const enrollment = await createEnrollment({
            studentId: Number(studentId),
            sectionId: Number(sectionId),
        });

        res.status(201).json(enrollment);
    } catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "Registration failed",
        });
    }
};