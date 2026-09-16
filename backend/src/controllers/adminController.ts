import { Request, Response } from "express";
import {
    getAllUsers,
    getUserById,
    assignUserRole,
    getEnrollmentReport,
} from "../services/adminService";

export const listUsers = async (
    _req: Request,
    res: Response
) => {
    try {
        const users = await getAllUsers();

        res.json({
            success: true,
            data: users,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch users",
        });
    }
};

export const getUser = async (
    req: Request,
    res: Response
) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const user = await getUserById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch user",
        });
    }
};

export const updateUserRole = async (
    req: Request,
    res: Response
) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const { roleName } = req.body;

        if (!roleName) {
            return res.status(400).json({
                success: false,
                message: "roleName is required",
            });
        }

        const user = await assignUserRole(id, roleName);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: `Role ${roleName} does not exist`,
            });
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update user role",
        });
    }
};

export const getEnrollments = async (
    _req: Request,
    res: Response
) => {
    try {
        const report = await getEnrollmentReport();

        res.json({
            success: true,
            data: report,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch enrollment report",
        });
    }
};
