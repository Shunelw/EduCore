import { Request, Response } from "express";
import {
    getAllSections,
    getSectionById,
    createSection,
    updateSection,
    deleteSection,
} from "../services/sectionService";

export const getSections = async (
    _req: Request,
    res: Response
) => {
    try {
        const sections = await getAllSections();

        res.json({
            success: true,
            data: sections,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch sections",
        });
    }
};

export const getSection = async (
    req: Request,
    res: Response
) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid section ID",
            });
        }

        const section = await getSectionById(id);

        if (!section) {
            return res.status(404).json({
                success: false,
                message: "Section not found",
            });
        }

        res.json({
            success: true,
            data: section,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch section",
        });
    }
};

export const createNewSection = async (
    req: Request,
    res: Response
) => {
    try {
        const section = await createSection({
            courseId: Number(req.body.courseId),
            semesterId: Number(req.body.semesterId),
            professorId: Number(req.body.professorId),
            capacity: Number(req.body.capacity),
            schedule: req.body.schedule,
        });

        res.status(201).json({
            success: true,
            data: section,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create section",
        });
    }
};

export const updateExistingSection = async (
    req: Request,
    res: Response
) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid section ID",
            });
        }

        const section = await updateSection(id, {
            courseId: req.body.courseId !== undefined
                ? Number(req.body.courseId)
                : undefined,
            semesterId: req.body.semesterId !== undefined
                ? Number(req.body.semesterId)
                : undefined,
            professorId: req.body.professorId !== undefined
                ? Number(req.body.professorId)
                : undefined,
            capacity: req.body.capacity !== undefined
                ? Number(req.body.capacity)
                : undefined,
            schedule: req.body.schedule,
        });

        res.json({
            success: true,
            data: section,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update section",
        });
    }
};

export const removeSection = async (
    req: Request,
    res: Response
) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid section ID",
            });
        }

        await deleteSection(id);

        res.json({
            success: true,
            message: "Section deleted successfully",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete section",
        });
    }
};