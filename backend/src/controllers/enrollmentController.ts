import { Response } from "express";
import {
    createEnrollment,
    getEnrollmentsByStudent,
    dropEnrollment,
} from "../services/enrollmentService";
import { AuthRequest } from "../middleware/authMiddleware";

export const registerStudent = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const studentId = req.user!.userId;
        const { sectionId } = req.body;

        const enrollment = await createEnrollment({
            studentId,
            sectionId
        });

        res.status(201).json({
            success: true,
            data: enrollment,
        });
    } catch (error) {
        console.error(error);

        res.status(400).json({
            success: false,
            message: "Unable to register for course",
        });
    }
};

export const getMyEnrollments = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const studentId = req.user!.userId;

        const enrollments = await getEnrollmentsByStudent(studentId);

        res.json({
            success: true,
            data: enrollments,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch registration history",
        });
    }
};

export const dropMyEnrollment = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const studentId = req.user!.userId;
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid enrollment ID",
            });
        }

        const enrollment = await dropEnrollment(id, studentId);

        res.json({
            success: true,
            data: enrollment,
        });
    } catch (error) {
        console.error(error);

        res.status(400).json({
            success: false,
            message: "Unable to drop course",
        });
    }
};


