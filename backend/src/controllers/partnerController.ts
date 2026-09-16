import { Request, Response } from "express";
import { verifyStudentByEmail } from "../services/partnerService";

export const verifyStudent = async (
    req: Request,
    res: Response
) => {
    try {
        const email = req.query.email as string | undefined;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "email query parameter is required",
            });
        }

        const result = await verifyStudentByEmail(email);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "No student found for that email",
            });
        }

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to verify student",
        });
    }
};
