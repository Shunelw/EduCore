import { Request, Response } from "express";
import {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
} from "../services/courseService";
import { Prisma } from "@prisma/client";
import {
    fetchTextbookInfo,
    isValidIsbn,
    normalizeIsbn,
} from "../services/openLibraryService";
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

export const lookupTextbook = async (
    req: Request,
    res: Response
) => {
    const rawIsbn = typeof req.query.isbn === "string" ? req.query.isbn : "";
    const isbn = normalizeIsbn(rawIsbn);

    if (!isValidIsbn(isbn)) {
        return res.status(400).json({
            success: false,
            message: "Enter a valid ISBN-10 or ISBN-13",
        });
    }

    let textbookInfo;

    try {
        textbookInfo = await fetchTextbookInfo(isbn);
    } catch {
        return res.status(503).json({
            success: false,
            message: "Open Library is temporarily unavailable. Try again later.",
        });
    }

    if (!textbookInfo) {
        return res.status(404).json({
            success: false,
            message: "No textbook was found for this ISBN",
        });
    }

    return res.json({
        success: true,
        data: textbookInfo,
    });
};

export const createNewCourse = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { courseCode, title, description, credits, department, isbn } =
            req.body;

        const normalizedIsbn = typeof isbn === "string"
            ? normalizeIsbn(isbn)
            : "";

        if (normalizedIsbn && !isValidIsbn(normalizedIsbn)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid ISBN-10 or ISBN-13",
            });
        }

        let textbookInfo = null;

        if (normalizedIsbn) {
            try {
                textbookInfo = await fetchTextbookInfo(normalizedIsbn);
            } catch {
                return res.status(503).json({
                    success: false,
                    message:
                        "Open Library is temporarily unavailable. Remove the ISBN or try again later.",
                });
            }

            if (!textbookInfo) {
                return res.status(404).json({
                    success: false,
                    message: "No textbook was found for this ISBN",
                });
            }
        }

        const course = await createCourse({
            courseCode,
            title,
            description,
            credits: Number(credits),
            department,
            createdBy: req.user!.userId,
            ...(normalizedIsbn ? { isbn: normalizedIsbn } : {}),
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

        const existingCourse = await getCourseById(id);

        if (!existingCourse) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        const { courseCode, title, description, credits, department, isbn } =
            req.body;

        const isbnWasProvided = isbn !== undefined;
        const normalizedIsbn = typeof isbn === "string"
            ? normalizeIsbn(isbn)
            : "";
        const isbnChanged =
            isbnWasProvided &&
            normalizedIsbn !== (existingCourse.isbn ?? "");
        const textbookInfoMissing = existingCourse.textbookInfo === null;

        if (normalizedIsbn && !isValidIsbn(normalizedIsbn)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid ISBN-10 or ISBN-13",
            });
        }

        let textbookInfo = null;

        if (
            isbnWasProvided &&
            normalizedIsbn &&
            (isbnChanged || textbookInfoMissing)
        ) {
            try {
                textbookInfo = await fetchTextbookInfo(normalizedIsbn);
            } catch {
                return res.status(503).json({
                    success: false,
                    message:
                        "Open Library is temporarily unavailable. Remove the ISBN or try again later.",
                });
            }

            if (!textbookInfo) {
                return res.status(404).json({
                    success: false,
                    message: "No textbook was found for this ISBN",
                });
            }
        }

        const course = await updateCourse(id, {
            courseCode,
            title,
            description,
            credits: credits !== undefined ? Number(credits) : undefined,
            department,
            ...(isbnWasProvided
                ? {
                      isbn: normalizedIsbn || null,
                  }
                : {}),
            ...(isbnChanged || (normalizedIsbn && textbookInfoMissing)
                ? { textbookInfo: textbookInfo ?? Prisma.DbNull }
                : {}),
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
