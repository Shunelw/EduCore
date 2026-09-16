import { Request, Response, NextFunction } from "express";

// Protects partner-facing endpoints. Unlike JWT auth (which identifies a
// logged-in EduCore user), this identifies a trusted external system using
// a shared secret sent in the x-api-key header.
export const requireApiKey = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey || apiKey !== process.env.PARTNER_API_KEY) {
        return res.status(401).json({
            message: "Invalid or missing API key",
        });
    }

    next();
};
