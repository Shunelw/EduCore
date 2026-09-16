import { Request, Response } from "express";
import {
    getAllSemesters,
    getSemesterById,
    createSemester,
    updateSemester,
    deleteSemester,
} from "../services/semesterService";

export const getSemesters = async (
    _req: Request,
    res: Response
) => {
    try {
        const semesters = await getAllSemesters();

        res.json({
            success: true,
            data: semesters,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch semesters",
        });
    }
};

export const getSemester = async (
    req: Request,
    res: Response
) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid semester ID",
            });
        }

        const semester = await getSemesterById(id);

        if (!semester) {
            return res.status(404).json({
                success: false,
                message: "Semester not found",
            });
        }

        res.json({
            success: true,
            data: semester,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch semester",
        });
    }
};

export const createNewSemester = async (
    req: Request,
    res: Response
) => {
    try {
        const semester = await createSemester({
            name: req.body.name,
            startDate: new Date(req.body.startDate),
            endDate: new Date(req.body.endDate),
        });

        res.status(201).json({
            success: true,
            data: semester,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create semester",
        });
    }
};

export const updateExistingSemester = async (
    req: Request,
    res: Response
) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid semester ID",
            });
        }

        const semester = await updateSemester(id, {
            name: req.body.name,
            startDate: req.body.startDate
                ? new Date(req.body.startDate)
                : undefined,
            endDate: req.body.endDate
                ? new Date(req.body.endDate)
                : undefined,
        });

        res.json({
            success: true,
            data: semester,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update semester",
        });
    }
};

export const removeSemester = async (
    req: Request,
    res: Response
) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid semester ID",
            });
        }

        await deleteSemester(id);

        res.json({
            success: true,
            message: "Semester deleted successfully",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete semester",
        });
    }
};
