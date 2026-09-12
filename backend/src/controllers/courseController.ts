import { Request, Response } from "express";
import {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
} from "../services/courseService";

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
    req: Request,
    res: Response
) => {
    try {
        const course = await createCourse(req.body);

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

        const course = await updateCourse(id, req.body);

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