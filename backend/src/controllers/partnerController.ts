import { Request, Response } from "express";
import { verifyStudentByEmail } from "../services/partnerService";
import { parsePartnerEmail } from "../utils/partnerRequest";

export const verifyStudent = async (
    req: Request,
    res: Response
) => {
    try {
        const email = parsePartnerEmail(req.query.email);

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "A single valid email query parameter is required",
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
