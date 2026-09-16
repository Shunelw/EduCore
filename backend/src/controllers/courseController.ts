import { Request, Response } from "express";
import {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
} from "../services/courseService";
import { fetchTextbookInfo } from "../services/openLibraryService";
import { AuthRequest } from "../middleware/authMiddleware";

export const getCourses = async (
    _req: Request,
    res: Response
) => {
    try {
        const courses = await getAllCourses();

        res.json({
            success: true,
            data: courses,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch courses",
        });
    }
};

export const getCourse = async (
    req: Request,
    res: Response
) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID",
            });
        }

        const course = await getCourseById(id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        res.json({
            success: true,
            data: course,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch course",
        });
    }
};

export const createNewCourse = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { courseCode, title, description, credits, department, isbn } =
            req.body;

        const textbookInfo = isbn
            ? await fetchTextbookInfo(isbn)
            : null;

        const course = await createCourse({
            courseCode,
            title,
            description,
            credits: Number(credits),
            department,
            isbn,
            createdBy: req.user!.userId,
            ...(textbookInfo ? { textbookInfo } : {}),
        });

        res.status(201).json({
            success: true,
            data: course,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create course",
        });
    }
};

export const updateExistingCourse = async (
    req: Request,
    res: Response
) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID",
            });
        }

        const { courseCode, title, description, credits, department, isbn } =
            req.body;

        const textbookInfo = isbn
            ? await fetchTextbookInfo(isbn)
            : null;

        const course = await updateCourse(id, {
            courseCode,
            title,
            description,
            credits: credits !== undefined ? Number(credits) : undefined,
            department,
            isbn,
            ...(textbookInfo ? { textbookInfo } : {}),
        });

        res.json({
            success: true,
            data: course,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update course",
        });
    }
};

export const removeCourse = async (
    req: Request,
    res: Response
) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID",
            });
        }

        await deleteCourse(id);

        res.json({
            success: true,
            message: "Course deleted successfully",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete course",
        });
    }
};